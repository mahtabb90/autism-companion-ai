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
  child_profile_id?: number;
}

export interface ChildProfile {
  id: number;
  name: string;
  age?: number;
  interests?: string;
  triggers?: string;
  sensory_preferences?: string;
  calming_tools?: string;
  communication_style?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ChildProfileCreate {
  name: string;
  age?: number;
  interests?: string;
  triggers?: string;
  sensory_preferences?: string;
  calming_tools?: string;
  communication_style?: string;
  notes?: string;
}

export type ChildProfileUpdate = Partial<ChildProfileCreate>;

export interface RoutineStep {
  label: string;
}

export interface Routine {
  id: number;
  title: string;
  category?: string;
  steps: string[];
  child_profile_id?: number;
  created_at: string;
  updated_at: string;
}

export interface RoutineCreate {
  title: string;
  category?: string;
  steps: string[];
  child_profile_id?: number;
}

export type RoutineUpdate = Partial<RoutineCreate>;
