export interface EmotionCheckIn {
  id: number;
  emotion: string;
  intensity: number;
  timestamp: string;
  notes?: string;
}

export interface EmotionCheckInCreate {
  emotion: string;
  intensity: number;
  notes?: string;
}

export interface Situation {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export interface SituationCreate {
  title: string;
  description: string;
}

export interface StoryPage {
  page_number: number;
  text: string;
  visual_prompt: string;
}

export interface Story {
  id: number;
  situation_id?: number;
  title: string;
  content: StoryPage[];
  created_at: string;
}

export interface StoryGenerateRequest {
  situation_id?: number;
  custom_situation_text?: string;
  custom_title?: string;
  child_name?: string;
  child_age?: number;
  key_details?: string;
}
