import { z } from 'zod';
import { uuid } from '../../utils/schemas';

export const chatIdParams = z.object({ chatId: uuid });
export const messageParams = z.object({ chatId: uuid, messageId: z.string().min(1).max(128) });

export const sendMessageBody = z.object({
  senderId: uuid,
  text: z.string().trim().min(1).max(4000),
});

export const getMessagesQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().datetime().optional(),
});

export const markReadBody = z.object({ userId: uuid });

export const lastSeenBody = z.object({
  userId: uuid,
  messageId: z.string().min(1).max(128),
});

export const editMessageBody = z.object({
  senderId: uuid,
  text: z.string().trim().min(1).max(4000),
});

export const deleteMessageBody = z.object({ senderId: uuid });
