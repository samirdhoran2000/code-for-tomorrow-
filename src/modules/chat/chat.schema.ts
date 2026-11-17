import { z } from 'zod';
import { uuid } from '../../utils/schemas';

export const createChatBody = z.object({
  userAId: uuid,
  userBId: uuid,
});

export const createGroupBody = z.object({
  name: z.string().trim().min(1).max(100),
  createdBy: uuid,
  memberIds: z.array(uuid).min(1).max(256),
});

export const chatIdParams = z.object({ chatId: uuid });

export const addMemberBody = z.object({
  requesterId: uuid,
  userId: uuid,
});

export const userIdParams = z.object({ userId: uuid });
