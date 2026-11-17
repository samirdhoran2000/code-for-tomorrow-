import { Timestamp } from 'firebase-admin/firestore';

export interface MessageDoc {
  senderId: string;
  text: string;
  createdAt: Timestamp;
  editedAt: Timestamp | null;
  isDeleted: boolean;
  readBy: Record<string, Timestamp>;
}

export interface LastSeenDoc {
  messageId: string;
  updatedAt: Timestamp;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
  editedAt: string | null;
  isDeleted: boolean;
  readBy: Record<string, string>;
}
