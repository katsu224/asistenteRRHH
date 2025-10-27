/**
 * @interface Bot
 * @property {string} id - The unique identifier for the bot.
 * @property {string} name - The name of the bot.
 * @property {string} image - The URL of the bot's avatar image.
 * @property {string} themeColor - The primary theme color for the bot's UI elements.
 * @property {string} darkThemeColor - The darker shade of the theme color, for hover effects.
 */
export interface Bot {
  id: string;
  name: string;
  image: string;
  themeColor: string;
  darkThemeColor: string;
}

/**
 * @interface KnowledgeItem
 * @property {string} id - The unique identifier for the knowledge item.
 * @property {string} name - The name of the knowledge item (e.g., file name).
 * @property {'text' | 'image'} type - The type of the knowledge item.
 * @property {string} content - The content of the knowledge item. For text, it's the raw text. For images, it's a base64 data URL.
 * @property {string} [mimeType] - The MIME type of the knowledge item, required for images (e.g., 'image/jpeg').
 */
export interface KnowledgeItem {
  id: string;
  name: string;
  type: 'text' | 'image';
  content: string; // Text content or base64 data URL for images
  mimeType?: string; // e.g., 'image/jpeg'
}

/**
 * @interface Message
 * @property {string} id - The unique identifier for the message.
 * @property {'user' | 'model'} role - The role of the entity that created the message.
 * @property {string} text - The text content of the message.
 * @property {string} [imageUrl] - An optional URL for an image to be displayed with the message.
 * @property {string} [relatedQuestionId] - The ID of the user's message to which this message is a response.
 */
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  relatedQuestionId?: string;
}

/**
 * @type ActionType
 * Represents the possible follow-up actions a user can take on a model's message.
 * 'explain': Request a different explanation of the same concept.
 * 'example': Request a concrete example related to the message.
 * 'image': Request a visual representation of the concept.
 */
export type ActionType = 'explain' | 'example' | 'image';
