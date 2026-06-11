import os
import json
import pathlib
import logging
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from .. import schemas, models

# Setup uvicorn error logging for FastAPI console visibility
logger = logging.getLogger("uvicorn.error")

# Manual dotenv loader to read environment variables from a .env file securely
def load_dotenv():
    # Look for .env in current working directory, backend/ and project root parent directories
    for folder in [
        pathlib.Path.cwd(), 
        pathlib.Path(__file__).parent.parent.parent, 
        pathlib.Path(__file__).parent.parent.parent.parent
    ]:
        for filename in [".env", "backend/.env"]:
            path = folder / filename
            if path.exists():
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        for line in f:
                            line = line.strip()
                            if line and not line.startswith("#") and "=" in line:
                                key, val = line.split("=", 1)
                                os.environ[key.strip()] = val.strip().strip('"').strip("'")
                except Exception as e:
                    print(f"Error loading env file {path}: {e}")

load_dotenv()

# Pydantic schema for Gemini structured JSON response
class StoryPageResponse(BaseModel):
    page_number: int
    text: str
    visual_prompt: str

class StoryResponseSchema(BaseModel):
    title: str
    pages: List[StoryPageResponse]


def _generate_mock_social_story(db: Session, request: schemas.StoryGenerateRequest, source: str = "fallback") -> schemas.StoryCreate:
    """Fallback generator producing predictable mock social stories locally."""
    situation_title = "New Situation"
    situation_desc = ""
    
    if request.situation_id:
        db_situation = db.query(models.Situation).filter(models.Situation.id == request.situation_id).first()
        if db_situation:
            situation_title = db_situation.title
            situation_desc = db_situation.description
            
    if request.custom_situation_text:
        # If both are provided, let's use the custom text as description
        if not request.situation_id:
            situation_title = "Custom Situation"
        situation_desc = request.custom_situation_text

    # We write in the 1st person. If a name is provided, we can personalize the intro page.
    poss_name = f"{request.child_name}'s" if request.child_name else "my"
    subj = request.child_name or "I"
    verb_is = "is" if request.child_name else "am"
    verb_go = "goes" if request.child_name else "go"
    verb_feel = "feels" if request.child_name else "feel"
    
    title = f"Story about {situation_title}"
    pages = []
    
    title_lower = situation_title.lower()
    
    if "dentist" in title_lower:
        pages = [
            {
                "page_number": 1, 
                "text": f"Today, {subj} {verb_is} going to visit the dentist. The dentist is a friendly helper who keeps {poss_name} teeth clean and strong.", 
                "visual_prompt": "A friendly dentist smiling and holding a giant cartoon tooth model"
            },
            {
                "page_number": 2, 
                "text": f"When we arrive, {subj} will sit in a special big chair. The chair can go up and down like a slow, fun ride.", 
                "visual_prompt": "A child sitting happily in a large adjustable dentist chair"
            },
            {
                "page_number": 3, 
                "text": f"The dentist will shine a bright light to look at {poss_name} teeth. If the light feels too bright, {subj} can wear cool sunglasses.", 
                "visual_prompt": "A child wearing green sunglasses, smiling under a circular dental light"
            },
            {
                "page_number": 4, 
                "text": f"They will use a tiny mirror and a small brush to clean {poss_name} teeth. The brush might tickle {poss_name} gums or hum like a bee.", 
                "visual_prompt": "A hand holding a tiny tooth mirror and a soft electric toothbrush"
            },
            {
                "page_number": 5, 
                "text": f"If {subj} {verb_feel} worried or {verb_go} need a break, {subj} can raise {poss_name} hand. The dentist will stop and take a deep breath with {subj}.", 
                "visual_prompt": "A child raising their hand with a calm smile, the dentist nodding respectfully"
            }
        ]
    elif "haircut" in title_lower or "hair" in title_lower:
        pages = [
            {
                "page_number": 1, 
                "text": f"Today, {subj} {verb_is} getting {poss_name} hair trimmed. Getting a haircut helps {poss_name} hair look neat and stay out of {poss_name} eyes.", 
                "visual_prompt": "A smiling child looking at their hair in a mirror"
            },
            {
                "page_number": 2, 
                "text": f"I will sit in a tall chair and wear a soft cape. The cape works like an umbrella to keep loose hairs off {poss_name} clothes.", 
                "visual_prompt": "A child wearing a colorful cape, sitting in a barber chair"
            },
            {
                "page_number": 3, 
                "text": f"The hairstylist will spray a little water to make {poss_name} hair damp. It feels like a cool, gentle mist.", 
                "visual_prompt": "A hand holding a spray bottle creating a light water mist"
            },
            {
                "page_number": 4, 
                "text": f"I will hear the snip-snip of scissors and the soft hum of clippers near {poss_name} ears. {subj} can hold {poss_name} favorite toy to feel safe.", 
                "visual_prompt": "Barber scissors cutting hair, child hugging a plush bear toy"
            },
            {
                "page_number": 5, 
                "text": f"{subj} will try to keep {poss_name} head still like a quiet statue. When we are done, {subj} will feel neat and proud.", 
                "visual_prompt": "A child with a fresh haircut smiling, holding up a star badge"
            }
        ]
    elif "share" in title_lower or "sharing" in title_lower or "toy" in title_lower:
        pages = [
            {
                "page_number": 1, 
                "text": f"When {subj} {verb_is} at school, {subj} {verb_go} to play with many fun toys. Other children like playing with them too.", 
                "visual_prompt": "Two children playing with colorful wooden blocks on a rug"
            },
            {
                "page_number": 2, 
                "text": f"Sometimes, another child wants to play with the toy {subj} {verb_is} holding. Sharing toys is a kind way to play together.", 
                "visual_prompt": "A child offering a green toy block to a friend who is smiling"
            },
            {
                "page_number": 3, 
                "text": f"We can take turns. {subj} can play with the toys first, and then {poss_name} friend can play. We can use a timer to know when it is time to switch.", 
                "visual_prompt": "A sand timer sitting next to building blocks"
            },
            {
                "page_number": 4, 
                "text": f"If {subj} {verb_go} want a toy someone else has, {subj} can ask nicely: 'May I play with that when you are done?'. Waiting can be hard, but {subj} can play with another toy while waiting.", 
                "visual_prompt": "A child asking a friend for a toy while pointing at a coloring book"
            },
            {
                "page_number": 5, 
                "text": f"Sharing and taking turns makes {poss_name} classmates feel happy. Playing together is fun for everyone.", 
                "visual_prompt": "Group of children holding hands and building a block tower together"
            }
        ]
    else:
        # Improved, specific, and warm custom/generic fallback text
        sit_desc_clean = situation_desc if situation_desc else f"trying new experiences with {situation_title}"
        pages = [
            {
                "page_number": 1, 
                "text": f"Today, {subj} {verb_is} learning about: {situation_title}. Exploring new situations helps {poss_name} mind learn, and it is a normal part of the day.", 
                "visual_prompt": f"A cute vector cartoon of a child looking at a path leading to {situation_title}"
            },
            {
                "page_number": 2, 
                "text": f"Here is what happens: {sit_desc_clean}. I can take it step by step, focusing on one small task at a time.", 
                "visual_prompt": "A simple drawing of stairs with visual progress dots"
            },
            {
                "page_number": 3, 
                "text": f"The parents and teachers around me want to help me feel safe. They feel very happy when I ask for help when I need it.", 
                "visual_prompt": "Smiling parents and helpers gesturing warmly and supportively"
            },
            {
                "page_number": 4, 
                "text": f"If I feel overwhelmed or hear loud noises, I can take three slow, deep breaths. This helps my body feel quiet and calm inside.", 
                "visual_prompt": "A child taking a deep breath with closed eyes and a peaceful face"
            },
            {
                "page_number": 5, 
                "text": f"By trying my best, {subj} learns how to handle new experiences. Everything will be okay, and I will feel very proud.", 
                "visual_prompt": "A child smiling and holding a shiny star balloon"
            }
        ]
        
    # Append a personalization slide if key details or special interests are present
    if request.key_details:
        pages.append({
            "page_number": len(pages) + 1,
            "text": f"Remember, {subj} can think about {request.key_details} to help stay calm and happy.",
            "visual_prompt": "A bright cloud containing images of peaceful and happy things"
        })

    return schemas.StoryCreate(
        title=title,
        situation_id=request.situation_id,
        generation_source=source,
        content=[schemas.StoryPage(**p) for p in pages]
    )

def generate_social_story(db: Session, request: schemas.StoryGenerateRequest) -> schemas.StoryCreate:
    # 1. Retrieve or define situation info
    situation_title = "New Situation"
    situation_desc = ""
    
    if request.situation_id:
        db_situation = db.query(models.Situation).filter(models.Situation.id == request.situation_id).first()
        if db_situation:
            situation_title = db_situation.title
            situation_desc = db_situation.description
            
    if request.custom_situation_text:
        # If both are provided, let's use the custom text as description
        if not request.situation_id:
            situation_title = "Custom Situation"
        situation_desc = request.custom_situation_text

    # 2. Check if Gemini API key is missing or set to placeholder
    api_key = os.getenv("GEMINI_API_KEY")
    is_missing = not api_key or api_key == "YOUR_API_KEY_HERE" or api_key.strip() == ""

    if is_missing:
        logger.warning("[AI Service] GEMINI_API_KEY is not configured or set to placeholder. Using fallback/mock generation mode.")
        return _generate_mock_social_story(db, request, source="fallback")

    # 3. Live Gemini API Generation
    child_name = request.child_name or "I"
    child_age = request.child_age
    key_details = request.key_details

    prompt_details = ""
    if request.child_name:
        prompt_details += f"- Personalize the story for a child named {child_name}.\n"
    if child_age:
        prompt_details += f"- The child's age is {child_age}. Tailor sentence complexity and vocabulary appropriately for this age.\n"
    if key_details:
        prompt_details += f"- Integrate the child's special details, comforts, or coping strategies: '{key_details}'. Weave this naturally into the text as an option to stay calm (e.g. holding a blanket, breathing, thinking of a safe interest).\n"

    prompt = f"""
You are a friendly educational expert specializing in writing Carol Gray Social Stories for children on the autism spectrum.
Write a personalized, reassuring, and highly structured Social Story based on these details:
- Story Title Topic: {situation_title}
- Story Scenario: {situation_desc}
- Child's Name: {child_name}
- Child's Age: {child_age or "Not specified"}
- Child's Details / Comforts / Interests / Triggers: {key_details or "None"}

Carol Gray Social Story Guidelines:
1. First-Person Perspective: The story MUST be written from the child's point of view using "I", "my", "me", "we". Even if the child's name is "{child_name}", refer to yourself as "I" or "me" (e.g., "My name is {child_name}. Today I am going to...").
2. Simple & Literal Language: Use clear, direct, and predictable words. Do not use abstract metaphors, figures of speech, sarcasm, or confusing figures of speech.
3. Descriptive Sentences: Explain objectively what is happening, where it is, and who is there (e.g., "The dental clinic has a special chair. The dentist works there to clean teeth.").
4. Perspective Sentences: Explain the positive thoughts, motivations, or feelings of other people (e.g., "The dentist wants to help my teeth stay healthy. This makes the dentist feel happy.").
5. Include Directive/Cooperative Sentences: Suggest calm, positive, and manageable actions the child can take (e.g., "If I need a break, I can raise my hand. The dentist will stop.").
{prompt_details}
6. Natural Personalization: Weave the child's name, interests, comforts, and triggers naturally into the narrative sentences. Do NOT list them as labels (e.g. do not write "Comfort: blue blanket" or "Focus on...". Instead, write: "I can hold my favorite blue blanket to help me feel calm.").

CRITICAL CONSTRAINT:
- The text of the story pages must consist ONLY of actual story narrative sentences that a child would read.
- DO NOT include instructions, notes, parent guides, meta-commentary, or prompt terms (like "Explain...", "Focus on...", "Note:", "Guideline:") in the output pages.
- Provide exactly 4 to 6 pages.
- Each page must have exactly 2 to 3 short, simple sentences.

You must return valid JSON matching this schema:
{{
  "title": "A friendly, child-appropriate title for the story",
  "pages": [
    {{
      "page_number": 1,
      "text": "2-3 short, simple story sentences written in the first person.",
      "visual_prompt": "A description of a friendly, calm, flat-vector Scandinavian style illustration matching this page"
    }}
  ]
}}
"""

    try:
        logger.info("[AI Service] Requesting social story generation from Gemini API...")
        # Initialize the client with the api key
        client = genai.Client(api_key=api_key)
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=StoryResponseSchema,
                temperature=0.2
            )
        )
        
        if not response.text:
            raise RuntimeError("Received empty response from Gemini API.")
            
        story_data = json.loads(response.text)
        title = story_data.get("title", f"Story about {situation_title}")
        pages = story_data.get("pages", [])
        
        story_pages = [
            schemas.StoryPage(
                page_number=page.get("page_number", idx + 1),
                text=page.get("text", ""),
                visual_prompt=page.get("visual_prompt", "")
            )
            for idx, page in enumerate(pages)
        ]
        
        if not story_pages:
            raise RuntimeError("Gemini generated a story with no pages.")
            
        logger.info(f"[AI Service] Successfully generated social story '{title}' from Gemini API.")
        return schemas.StoryCreate(
            title=title,
            situation_id=request.situation_id,
            generation_source="gemini",
            content=story_pages
        )
        
    except Exception as e:
        # Fall back to mock story generation on ANY live failure or parse error
        logger.error(f"[AI Service] Gemini AI generation failed: {e}. Falling back to mock generation mode.")
        return _generate_mock_social_story(db, request, source="fallback")
