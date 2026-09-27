import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# ---------------------------------------------------------------------------
# Routine Endpoint Tests
# ---------------------------------------------------------------------------

def test_create_routine():
    payload = {
        "title": "Morning Routine",
        "category": "Morning",
        "steps": ["Wake up", "Brush teeth", "Get dressed", "Eat breakfast", "Pack bag"]
    }
    response = client.post("/api/routines/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Morning Routine"
    assert data["category"] == "Morning"
    assert isinstance(data["steps"], list)
    assert len(data["steps"]) == 5
    assert data["steps"][0] == "Wake up"
    assert "id" in data
    assert "created_at" in data

def test_get_routines():
    client.post("/api/routines/", json={
        "title": "Bedtime Routine",
        "category": "Bedtime",
        "steps": ["Put on pyjamas", "Brush teeth", "Read a story", "Lights off"]
    })
    response = client.get("/api/routines/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "steps" in data[0]
    assert isinstance(data[0]["steps"], list)

def test_get_single_routine():
    create_resp = client.post("/api/routines/", json={
        "title": "School Routine",
        "category": "School",
        "steps": ["Arrive at school", "Hang coat", "Sit at desk", "Listen to teacher"]
    })
    routine_id = create_resp.json()["id"]

    response = client.get(f"/api/routines/{routine_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == routine_id
    assert data["title"] == "School Routine"

def test_get_routine_not_found():
    response = client.get("/api/routines/99999")
    assert response.status_code == 404

def test_update_routine():
    create_resp = client.post("/api/routines/", json={
        "title": "Bath Routine",
        "category": "Evening",
        "steps": ["Fill tub", "Get in", "Wash hair", "Rinse", "Dry off"]
    })
    routine_id = create_resp.json()["id"]

    update_resp = client.put(f"/api/routines/{routine_id}", json={
        "title": "Bath Time Routine",
        "steps": ["Fill tub", "Get in", "Wash hair", "Rinse", "Dry off", "Put on pyjamas"]
    })
    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["title"] == "Bath Time Routine"
    assert len(data["steps"]) == 6

def test_delete_routine():
    create_resp = client.post("/api/routines/", json={
        "title": "Playground Routine",
        "category": "After School",
        "steps": ["Put on shoes", "Walk to park", "Play on swings", "Head home"]
    })
    routine_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/routines/{routine_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["detail"] == "Routine deleted successfully"

    get_resp = client.get(f"/api/routines/{routine_id}")
    assert get_resp.status_code == 404

def test_routine_with_child_profile():
    profile_resp = client.post("/api/child-profiles/", json={"name": "Alex", "age": 7})
    profile_id = profile_resp.json()["id"]

    create_resp = client.post("/api/routines/", json={
        "title": "Alex Morning Routine",
        "category": "Morning",
        "steps": ["Wake up", "Stretch", "Breakfast"],
        "child_profile_id": profile_id
    })
    assert create_resp.status_code == 200
    assert create_resp.json()["child_profile_id"] == profile_id

    filter_resp = client.get(f"/api/routines/?child_profile_id={profile_id}")
    assert filter_resp.status_code == 200
    routines = filter_resp.json()
    assert any(r["title"] == "Alex Morning Routine" for r in routines)
