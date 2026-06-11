import pytest
import os
import json
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models import EmotionCheckIn, Situation, Story

# Create a clean test client
client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_get_emotions():
    response = client.get("/api/emotions/")
    assert response.status_code == 200
    # Because of seeding, we expect at least 4 items
    data = response.json()
    assert len(data) >= 4
    assert "emotion" in data[0]

def test_create_emotion():
    payload = {
        "emotion": "excited",
        "intensity": 2,
        "notes": "Testing backend api"
    }
    response = client.post("/api/emotions/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["emotion"] == "excited"
    assert data["intensity"] == 2
    assert data["notes"] == "Testing backend api"
    assert "id" in data

def test_get_situations():
    response = client.get("/api/situations/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    assert any(s["title"] == "Going to the Dentist" for s in data)

def test_create_situation():
    payload = {
        "title": "Taking a Bath",
        "description": "Learning the steps to wash up and play safely in the bathtub."
    }
    response = client.post("/api/situations/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Taking a Bath"
    assert "id" in data

def test_get_stories():
    response = client.get("/api/stories/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    assert "content" in data[0]
    assert isinstance(data[0]["content"], list)

def test_generate_story_preseeded():
    # Dentist is seeded, so it should trigger the custom dentist mock generator
    payload = {
        "situation_id": 1,
        "child_name": "Leo",
        "key_details": "favorite blue blanket"
    }
    response = client.post("/api/stories/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Story about" in data["title"]
    assert len(data["content"]) == 6  # 5 standard pages + 1 details page
    # Verify name replacement
    assert "Leo" in data["content"][0]["text"]
    assert "favorite blue blanket" in data["content"][5]["text"]

def test_generate_story_custom():
    payload = {
        "custom_situation_text": "Going to a birthday party with loud balloons.",
        "child_name": "Sam",
        "key_details": "loves music"
    }
    response = client.post("/api/stories/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Story about Custom Situation"
    assert len(data["content"]) == 6  # 5 default pages + 1 details page
    assert "Sam" in data["content"][0]["text"]
    assert "loves music" in data["content"][5]["text"]


def test_generate_story_gemini_success():
    # Set GEMINI_API_KEY to test the live path
    with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_test_api_key"}):
        with patch("app.services.ai_service.genai.Client") as mock_client_class:
            mock_client = MagicMock()
            mock_client_class.return_value = mock_client
            
            mock_response = MagicMock()
            mock_response.text = json.dumps({
                "title": "Story about Dentist from Gemini",
                "pages": [
                    {"page_number": 1, "text": "Today, I am going to the dentist.", "visual_prompt": "A happy tooth"},
                    {"page_number": 2, "text": "It will be okay.", "visual_prompt": "A thumbs up"}
                ]
            })
            mock_client.models.generate_content.return_value = mock_response

            payload = {
                "custom_situation_text": "Visiting the dentist",
                "child_name": "Oliver"
            }
            response = client.post("/api/stories/generate", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["title"] == "Story about Dentist from Gemini"
            assert len(data["content"]) == 2
            assert data["content"][0]["text"] == "Today, I am going to the dentist."
            assert data["content"][0]["visual_prompt"] == "A happy tooth"
            assert data["generation_source"] == "gemini"

            # Check that Client was initialized with correct key
            mock_client_class.assert_called_once_with(api_key="fake_test_api_key")


def test_generate_story_gemini_error():
    # Test fallback to mock when Gemini client fails
    with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_test_api_key"}):
        with patch("app.services.ai_service.genai.Client") as mock_client_class:
            mock_client = MagicMock()
            mock_client_class.return_value = mock_client
            
            # Simulate API error
            mock_client.models.generate_content.side_effect = Exception("API connection timeout")

            payload = {
                "situation_id": 1,
                "child_name": "Oliver"
            }
            response = client.post("/api/stories/generate", json=payload)
            assert response.status_code == 200
            data = response.json()
            # Verify it fell back to the preseeded mock dentist story
            assert "Story about Going to the Dentist" in data["title"]
            assert len(data["content"]) == 5
            assert "Oliver" in data["content"][0]["text"]
            assert data["generation_source"] == "fallback"


def test_generate_story_gemini_fallback():
    # Test fallback when API key is unset/placeholder
    with patch.dict(os.environ, {"GEMINI_API_KEY": "YOUR_API_KEY_HERE"}):
        payload = {
            "situation_id": 1,
            "child_name": "Leo",
            "key_details": "favorite blue blanket"
        }
        response = client.post("/api/stories/generate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "Story about" in data["title"]
        assert len(data["content"]) == 6  # Runs fallback mock logic
        assert data["generation_source"] == "fallback"


def test_generate_story_deduplication():
    # Clean up any existing stories for situation_id = 1 to ensure a clean state
    db = SessionLocal()
    db.query(Story).filter(Story.situation_id == 1).delete()
    db.commit()
    db.close()

    # 1. Fetch current count of stories
    response = client.get("/api/stories/")
    assert response.status_code == 200
    initial_stories = response.json()
    initial_count = len(initial_stories)
    
    # 2. Generate a story for situation_id = 1 (Going to the Dentist)
    payload = {
        "situation_id": 1,
        "child_name": "Leo",
        "key_details": "favorite blue blanket"
    }
    response = client.post("/api/stories/generate", json=payload)
    assert response.status_code == 200
    
    # 3. Get stories count after first generation
    response = client.get("/api/stories/")
    assert response.status_code == 200
    count_after_first = len(response.json())
    assert count_after_first == initial_count + 1
    
    # 4. Generate again for situation_id = 1 with different name
    payload2 = {
        "situation_id": 1,
        "child_name": "Sam"
    }
    response = client.post("/api/stories/generate", json=payload2)
    assert response.status_code == 200
    
    # 5. Verify total story count did not increase
    response2 = client.get("/api/stories/")
    assert response2.status_code == 200
    updated_stories = response2.json()
    assert len(updated_stories) == count_after_first
    
    # Verify the newest story content belongs to "Sam"
    dentist_story = next(s for s in updated_stories if s["situation_id"] == 1)
    assert "Sam" in dentist_story["content"][0]["text"]


def test_generate_custom_story_deduplication():
    # Clean up any existing custom stories with the same title
    db = SessionLocal()
    db.query(Story).filter(Story.title == "Story about Custom Situation").delete()
    db.commit()
    db.close()
    
    # 1. Fetch current count of stories
    response = client.get("/api/stories/")
    assert response.status_code == 200
    initial_count = len(response.json())
    
    # 2. Generate custom story first time
    payload1 = {
        "custom_situation_text": "Going to a new playground.",
        "child_name": "Anna"
    }
    response = client.post("/api/stories/generate", json=payload1)
    assert response.status_code == 200
    
    # 3. Get stories and count after first generation
    response = client.get("/api/stories/")
    assert response.status_code == 200
    count_after_first = len(response.json())
    assert count_after_first == initial_count + 1
    
    # 4. Generate custom story second time with the same situation/title
    payload2 = {
        "custom_situation_text": "Going to a new playground.",
        "child_name": "Zoe"
    }
    response = client.post("/api/stories/generate", json=payload2)
    assert response.status_code == 200
    
    # 5. Verify count remains the same and contents updated
    response = client.get("/api/stories/")
    assert response.status_code == 200
    stories_after = response.json()
    assert len(stories_after) == count_after_first
    
    custom_story = next(s for s in stories_after if s["title"] == "Story about Custom Situation")
    assert "Zoe" in custom_story["content"][0]["text"]


def test_delete_story_success():
    # 1. Generate a custom story to delete
    payload = {
        "custom_situation_text": "Going to buy groceries.",
        "child_name": "Kevin"
    }
    response = client.post("/api/stories/generate", json=payload)
    assert response.status_code == 200
    story_id = response.json()["id"]

    # 2. Delete the generated story
    response_del = client.delete(f"/api/stories/{story_id}")
    assert response_del.status_code == 200
    assert response_del.json()["detail"] == "Story deleted successfully"

    # 3. Verify it is gone
    response_get = client.get(f"/api/stories/{story_id}")
    assert response_get.status_code == 404


def test_delete_story_not_found():
    response = client.delete("/api/stories/999999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Story not found"

def test_generate_story_with_custom_title():
    payload = {
        "custom_situation_text": "Going to a birthday party with loud balloons.",
        "custom_title": "Leo Gets a Haircut",
        "child_name": "Sam",
        "key_details": "loves music"
    }
    response = client.post("/api/stories/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Leo Gets a Haircut"

def test_generate_story_gemini_custom_title():
    with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_test_api_key"}):
        with patch("app.services.ai_service.genai.Client") as mock_client_class:
            mock_client = MagicMock()
            mock_client_class.return_value = mock_client
            
            mock_response = MagicMock()
            mock_response.text = json.dumps({
                "title": "Story about Leo Gets a Haircut from Gemini",
                "pages": [
                    {"page_number": 1, "text": "Today, I am getting a haircut.", "visual_prompt": "A happy hair"}
                ]
            })
            mock_client.models.generate_content.return_value = mock_response

            payload = {
                "custom_situation_text": "Visiting the barber",
                "custom_title": "Leo Gets a Haircut",
                "child_name": "Oliver"
            }
            response = client.post("/api/stories/generate", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["title"] == "Leo Gets a Haircut"



