import json
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator, ConfigDict

class EmotionCheckInBase(BaseModel):
    emotion: str
    intensity: int = Field(default=1, ge=1, le=3)
    notes: Optional[str] = None

class EmotionCheckInCreate(EmotionCheckInBase):
    pass

class EmotionCheckIn(EmotionCheckInBase):
    id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class SituationBase(BaseModel):
    title: str
    description: str

class SituationCreate(SituationBase):
    pass

class Situation(SituationBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class StoryPage(BaseModel):
    page_number: int
    text: str
    visual_prompt: str

class StoryBase(BaseModel):
    title: str
    situation_id: Optional[int] = None
    generation_source: Optional[str] = "fallback"

class StoryCreate(StoryBase):
    content: List[StoryPage]

class Story(StoryBase):
    id: int
    content: List[StoryPage]
    created_at: datetime

    @model_validator(mode='before')
    @classmethod
    def parse_content_json(cls, data):
        # If it's a SQLAlchemy object
        if not isinstance(data, dict):
            res = {}
            for col in ['id', 'situation_id', 'title', 'generation_source', 'created_at']:
                res[col] = getattr(data, col, None)
            
            raw_content = getattr(data, 'content', '[]')
            if isinstance(raw_content, str):
                try:
                    res['content'] = json.loads(raw_content)
                except Exception:
                    res['content'] = []
            else:
                res['content'] = raw_content
            return res
        else:
            if isinstance(data.get('content'), str):
                try:
                    data['content'] = json.loads(data['content'])
                except Exception:
                    data['content'] = []
            return data

    model_config = ConfigDict(from_attributes=True)

class StoryGenerateRequest(BaseModel):
    situation_id: Optional[int] = None
    custom_situation_text: Optional[str] = None
    custom_title: Optional[str] = None
    child_name: Optional[str] = None
    child_age: Optional[int] = None
    key_details: Optional[str] = None  # e.g. "loves space", "scared of loud noises"
