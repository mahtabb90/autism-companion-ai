from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(
    prefix="/child-profiles",
    tags=["child-profiles"]
)

@router.get("/", response_model=List[schemas.ChildProfile])
def read_child_profiles(db: Session = Depends(database.get_db)):
    """Return all saved child profiles, most recent first."""
    return crud.get_child_profiles(db)

@router.get("/{profile_id}", response_model=schemas.ChildProfile)
def read_child_profile(profile_id: int, db: Session = Depends(database.get_db)):
    """Return a single child profile by ID."""
    db_profile = crud.get_child_profile(db, profile_id=profile_id)
    if db_profile is None:
        raise HTTPException(status_code=404, detail="Child profile not found")
    return db_profile

@router.post("/", response_model=schemas.ChildProfile)
def create_child_profile(
    profile_in: schemas.ChildProfileCreate,
    db: Session = Depends(database.get_db)
):
    """Create and save a new child profile."""
    return crud.create_child_profile(db, profile_in=profile_in)

@router.put("/{profile_id}", response_model=schemas.ChildProfile)
def update_child_profile(
    profile_id: int,
    profile_in: schemas.ChildProfileUpdate,
    db: Session = Depends(database.get_db)
):
    """Update an existing child profile (partial updates supported)."""
    db_profile = crud.update_child_profile(db, profile_id=profile_id, profile_in=profile_in)
    if db_profile is None:
        raise HTTPException(status_code=404, detail="Child profile not found")
    return db_profile

@router.delete("/{profile_id}")
def delete_child_profile(profile_id: int, db: Session = Depends(database.get_db)):
    """Permanently delete a child profile."""
    success = crud.delete_child_profile(db, profile_id=profile_id)
    if not success:
        raise HTTPException(status_code=404, detail="Child profile not found")
    return {"detail": "Child profile deleted successfully"}
