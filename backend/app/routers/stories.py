from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database
from ..services import ai_service

router = APIRouter(
    prefix="/stories",
    tags=["stories"]
)

@router.get("/", response_model=List[schemas.Story])
def read_stories(db: Session = Depends(database.get_db)):
    return crud.get_stories(db)

@router.get("/{story_id}", response_model=schemas.Story)
def read_story(story_id: int, db: Session = Depends(database.get_db)):
    db_story = crud.get_story(db, story_id=story_id)
    if db_story is None:
        raise HTTPException(status_code=404, detail="Story not found")
    return db_story

@router.post("/generate", response_model=schemas.Story)
def generate_story(request: schemas.StoryGenerateRequest, db: Session = Depends(database.get_db)):
    try:
        # Generate story using the AI service
        story_create = ai_service.generate_social_story(db, request)
        # Persist the generated story in the database
        db_story = crud.create_story(db, story_create)
        return db_story
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Gemini AI Service Unavailable: {str(e)}")

@router.delete("/{story_id}")
def delete_story(story_id: int, db: Session = Depends(database.get_db)):
    success = crud.delete_story(db, story_id=story_id)
    if not success:
        raise HTTPException(status_code=404, detail="Story not found")
    return {"detail": "Story deleted successfully"}
