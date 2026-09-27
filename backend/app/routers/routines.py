from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import crud, schemas, database

router = APIRouter(
    prefix="/routines",
    tags=["routines"]
)

@router.get("/", response_model=List[schemas.Routine])
def read_routines(
    child_profile_id: Optional[int] = None,
    db: Session = Depends(database.get_db)
):
    return crud.get_routines(db, child_profile_id=child_profile_id)

@router.get("/{routine_id}", response_model=schemas.Routine)
def read_routine(routine_id: int, db: Session = Depends(database.get_db)):
    db_routine = crud.get_routine(db, routine_id=routine_id)
    if db_routine is None:
        raise HTTPException(status_code=404, detail="Routine not found")
    return db_routine

@router.post("/", response_model=schemas.Routine)
def create_routine(routine: schemas.RoutineCreate, db: Session = Depends(database.get_db)):
    return crud.create_routine(db, routine_in=routine)

@router.put("/{routine_id}", response_model=schemas.Routine)
def update_routine(routine_id: int, routine: schemas.RoutineUpdate, db: Session = Depends(database.get_db)):
    db_routine = crud.update_routine(db, routine_id=routine_id, routine_in=routine)
    if db_routine is None:
        raise HTTPException(status_code=404, detail="Routine not found")
    return db_routine

@router.delete("/{routine_id}")
def delete_routine(routine_id: int, db: Session = Depends(database.get_db)):
    success = crud.delete_routine(db, routine_id=routine_id)
    if not success:
        raise HTTPException(status_code=404, detail="Routine not found")
    return {"detail": "Routine deleted successfully"}
