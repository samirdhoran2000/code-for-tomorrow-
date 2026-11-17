import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ChatController } from './chat.controller';

export function createChatRouter(controller: ChatController): Router {
  const router = Router();
  router.post('/create', asyncHandler(controller.createOrGet));
  router.post('/group', asyncHandler(controller.createGroup)); // bonus
  router.post('/:chatId/members', asyncHandler(controller.addMember)); // bonus
  return router;
}

export function createUserChatsRouter(controller: ChatController): Router {
  const router = Router();
  router.get('/:userId/chats', asyncHandler(controller.listUserChats));
  return router;
}
