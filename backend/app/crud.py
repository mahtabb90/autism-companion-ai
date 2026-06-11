import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from . import models, schemas

# Emotion Check-in CRUD
def get_emotions(db: Session, limit: int = 100):
    return db.query(models.EmotionCheckIn).order_by(models.EmotionCheckIn.timestamp.desc()).limit(limit).all()

def create_emotion(db: Session, emotion_in: schemas.EmotionCheckInCreate):
    db_emotion = models.EmotionCheckIn(
        emotion=emotion_in.emotion,
        intensity=emotion_in.intensity,
        notes=emotion_in.notes,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(db_emotion)
    db.commit()
    db.refresh(db_emotion)
    return db_emotion

# Situation CRUD
def get_situations(db: Session):
    return db.query(models.Situation).order_by(models.Situation.created_at.desc()).all()

def get_situation(db: Session, situation_id: int):
    return db.query(models.Situation).filter(models.Situation.id == situation_id).first()

def create_situation(db: Session, situation_in: schemas.SituationCreate):
    db_situation = models.Situation(
        title=situation_in.title,
        description=situation_in.description,
        created_at=datetime.now(timezone.utc)
    )
    db.add(db_situation)
    db.commit()
    db.refresh(db_situation)
    return db_situation

# Story CRUD
def get_stories(db: Session):
    return db.query(models.Story).order_by(models.Story.id.desc()).all()

def get_story(db: Session, story_id: int):
    return db.query(models.Story).filter(models.Story.id == story_id).first()

def create_story(db: Session, story_in: schemas.StoryCreate):
    # Serialize the list of StoryPage objects to JSON string
    serialized_content = json.dumps([page.model_dump() for page in story_in.content])
    
    # Check if a story already exists for this topic/situation
    db_story = None
    if story_in.situation_id is not None:
        db_story = db.query(models.Story).filter(models.Story.situation_id == story_in.situation_id).first()
    
    if not db_story:
        db_story = db.query(models.Story).filter(models.Story.title == story_in.title).first()
        
    if db_story:
        # Update existing story
        db_story.title = story_in.title
        db_story.content = serialized_content
        db_story.generation_source = story_in.generation_source
        db_story.created_at = datetime.now(timezone.utc)
        if story_in.situation_id is not None:
            db_story.situation_id = story_in.situation_id
        db.commit()
        db.refresh(db_story)
        return db_story
    else:
        # Create a new story
        db_story = models.Story(
            title=story_in.title,
            situation_id=story_in.situation_id,
            content=serialized_content,
            generation_source=story_in.generation_source,
            created_at=datetime.now(timezone.utc)
        )
        db.add(db_story)
        db.commit()
        db.refresh(db_story)
        return db_story

def delete_story(db: Session, story_id: int) -> bool:
    db_story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if db_story:
        db.delete(db_story)
        db.commit()
        return True
    return False

# Database Seeding
def seed_database_if_empty(db: Session):
    # 1. Seed Situations (check if each exists by title)
    dentist = db.query(models.Situation).filter(models.Situation.title == "Going to the Dentist").first()
    if not dentist:
        dentist = models.Situation(
            title="Going to the Dentist",
            description="A visit to the dental clinic for a routine check-up and teeth cleaning.",
            created_at=datetime.now(timezone.utc)
        )
        db.add(dentist)
        db.commit()
        db.refresh(dentist)

    haircut = db.query(models.Situation).filter(models.Situation.title == "Getting a Haircut").first()
    if not haircut:
        haircut = models.Situation(
            title="Getting a Haircut",
            description="Visiting the hair salon to get hair trimmed while sitting in a styling chair.",
            created_at=datetime.now(timezone.utc)
        )
        db.add(haircut)
        db.commit()
        db.refresh(haircut)

    sharing = db.query(models.Situation).filter(models.Situation.title == "Sharing Toys at School").first()
    if not sharing:
        sharing = models.Situation(
            title="Sharing Toys at School",
            description="Learning to share toys and take turns with other children during playtime.",
            created_at=datetime.now(timezone.utc)
        )
        db.add(sharing)
        db.commit()
        db.refresh(sharing)
    
    # 2. Seed Stories (check if each exists by title)
    dentist_story_content = [
        {"page_number": 1, "text": "Today, I am going to visit the dentist. The dentist is a friendly helper who keeps my teeth clean and strong.", "visual_prompt": "A friendly dentist smiling and holding a giant cartoon tooth model"},
        {"page_number": 2, "text": "When we arrive, I will sit in a special big chair. The chair can go up and down like a slow, fun ride.", "visual_prompt": "A child sitting happily in a large adjustable dentist chair"},
        {"page_number": 3, "text": "The dentist will shine a bright light to look at my teeth. If the light feels too bright, I can wear cool sunglasses.", "visual_prompt": "A child wearing green sunglasses, smiling under a circular dental light"},
        {"page_number": 4, "text": "They will use a tiny mirror and a small brush to clean my teeth. The brush might tickle my gums or hum like a bee.", "visual_prompt": "A hand holding a tiny tooth mirror and a soft electric toothbrush"},
        {"page_number": 5, "text": "If I need the dentist to pause, I can raise my hand. The dentist will stop and we can take a deep breath together.", "visual_prompt": "A child raising their hand with a calm smile, the dentist nodding respectfully"}
    ]
    
    haircut_story_content = [
        {"page_number": 1, "text": "Today, I am getting my hair trimmed. Getting a haircut helps my hair look neat and stay out of my eyes.", "visual_prompt": "A smiling child looking at their hair in a mirror"},
        {"page_number": 2, "text": "I will sit in a tall chair and wear a soft cape. The cape works like an umbrella to keep loose hairs off my clothes.", "visual_prompt": "A child wearing a colorful cape, sitting in a barber chair"},
        {"page_number": 3, "text": "The hairstylist will spray a little water to make my hair damp. It feels like a cool, gentle mist.", "visual_prompt": "A hand holding a spray bottle creating a light water mist"},
        {"page_number": 4, "text": "I will hear the snip-snip of scissors and the soft hum of clippers near my ears. I can hold my favorite toy to feel safe.", "visual_prompt": "Barber scissors cutting hair, child hugging a plush bear toy"},
        {"page_number": 5, "text": "I will try to keep my head still like a quiet statue. When we are done, I will feel neat and proud of myself.", "visual_prompt": "A child with a fresh haircut smiling, holding up a star badge"}
    ]

    sharing_story_content = [
        {"page_number": 1, "text": "When I am at school, I get to play with many fun toys like blocks and puzzles. Other children like playing with them too.", "visual_prompt": "Two children playing with colorful wooden blocks on a rug"},
        {"page_number": 2, "text": "Sometimes, another child wants to play with the toy I am holding. Sharing toys is a kind way to play together.", "visual_prompt": "A child offering a green toy block to a friend who is smiling"},
        {"page_number": 3, "text": "We can take turns. I can play with the blocks first, and then my friend can play. We can use a timer to know when it is time to switch.", "visual_prompt": "A sand timer sitting next to building blocks"},
        {"page_number": 4, "text": "If I want a toy someone else has, I can ask nicely: 'May I play with that when you are done?'. Waiting can be hard, but I can draw or play with another toy while I wait.", "visual_prompt": "A child asking a friend for a toy while pointing at a coloring book"},
        {"page_number": 5, "text": "Sharing and taking turns makes my classmates feel happy. Playing together is fun for everyone.", "visual_prompt": "Group of children holding hands and building a block tower together"}
    ]

    if not db.query(models.Story).filter(models.Story.title == "Going to the Dentist").first():
        db_dentist_story = models.Story(
            title="Going to the Dentist",
            situation_id=dentist.id,
            content=json.dumps(dentist_story_content),
            created_at=datetime.now(timezone.utc)
        )
        db.add(db_dentist_story)
    
    if not db.query(models.Story).filter(models.Story.title == "Getting a Haircut").first():
        db_haircut_story = models.Story(
            title="Getting a Haircut",
            situation_id=haircut.id,
            content=json.dumps(haircut_story_content),
            created_at=datetime.now(timezone.utc)
        )
        db.add(db_haircut_story)

    if not db.query(models.Story).filter(models.Story.title == "Sharing Toys with Friends").first():
        db_sharing_story = models.Story(
            title="Sharing Toys with Friends",
            situation_id=sharing.id,
            content=json.dumps(sharing_story_content),
            created_at=datetime.now(timezone.utc)
        )
        db.add(db_sharing_story)

    db.commit()

    # 3. Seed Emotions (only if the table is completely empty)
    if db.query(models.EmotionCheckIn).count() == 0:
        db_emotions = [
            models.EmotionCheckIn(emotion="happy", intensity=2, notes="Excited to play with blocks.", timestamp=datetime.now(timezone.utc)),
            models.EmotionCheckIn(emotion="anxious", intensity=3, notes="Worried about loud playground noises.", timestamp=datetime.now(timezone.utc)),
            models.EmotionCheckIn(emotion="overwhelmed", intensity=3, notes="Felt crowded during lunchtime.", timestamp=datetime.now(timezone.utc)),
            models.EmotionCheckIn(emotion="calm", intensity=2, notes="Enjoyed reading the dentist story.", timestamp=datetime.now(timezone.utc))
        ]
        db.add_all(db_emotions)
        db.commit()
