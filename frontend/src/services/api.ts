import type { 
  EmotionCheckIn, 
  EmotionCheckInCreate, 
  Situation, 
  SituationCreate, 
  Story, 
  StoryGenerateRequest 
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.detail || response.statusText || 'API error';
    throw new Error(message);
  }
  return response.json();
}

export const api = {
  // Emotion Endpoints
  async getEmotions(): Promise<EmotionCheckIn[]> {
    const response = await fetch(`${API_BASE_URL}/emotions/`);
    return handleResponse<EmotionCheckIn[]>(response);
  },

  async createEmotion(emotion: EmotionCheckInCreate): Promise<EmotionCheckIn> {
    const response = await fetch(`${API_BASE_URL}/emotions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emotion),
    });
    return handleResponse<EmotionCheckIn>(response);
  },

  // Situation Endpoints
  async getSituations(): Promise<Situation[]> {
    const response = await fetch(`${API_BASE_URL}/situations/`);
    return handleResponse<Situation[]>(response);
  },

  async createSituation(situation: SituationCreate): Promise<Situation> {
    const response = await fetch(`${API_BASE_URL}/situations/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(situation),
    });
    return handleResponse<Situation>(response);
  },

  // Story Endpoints
  async getStories(): Promise<Story[]> {
    const response = await fetch(`${API_BASE_URL}/stories/`);
    return handleResponse<Story[]>(response);
  },

  async getStory(id: number): Promise<Story> {
    const response = await fetch(`${API_BASE_URL}/stories/${id}`);
    return handleResponse<Story>(response);
  },

  async generateStory(request: StoryGenerateRequest): Promise<Story> {
    const response = await fetch(`${API_BASE_URL}/stories/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return handleResponse<Story>(response);
  },

  async deleteStory(id: number): Promise<{ detail: string }> {
    const response = await fetch(`${API_BASE_URL}/stories/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ detail: string }>(response);
  },
};
