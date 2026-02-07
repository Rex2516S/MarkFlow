export type BlockType = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'paragraph' 
  | 'image' 
  | 'code' 
  | 'blockquote' 
  | 'list-ul' 
  | 'list-ol'
  | 'divider';

export interface BlockData {
  id: string;
  type: BlockType;
  content: string; // Used for text, url for images, code content, etc.
  metadata?: {
    language?: string; // For code blocks
    alt?: string; // For images
    items?: string[]; // For lists
  };
}

export interface GeneratedBlockResponse {
  type: BlockType;
  content: string;
  metadata?: {
    language?: string;
    alt?: string;
    items?: string[];
  };
}
