export interface Bot {
  id: string;
  name: string;
  image: string;
  themeColor: string;
  darkThemeColor: string;
}

export interface KnowledgeItem {
  id: string;
  name: string;
  type: 'text' | 'image';
  content: string; // Text content or base64 data URL for images
  mimeType?: string; // e.g., 'image/jpeg'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  relatedQuestionId?: string;
}

export type ActionType = 'explain' | 'example' | 'image';
