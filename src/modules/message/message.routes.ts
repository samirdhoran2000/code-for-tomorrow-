import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { MessageController } from './message.controller';

export function createMessageRouter(controller: MessageController): Router {
  const router = Router();
  router.post('/:chatId/message/send', asyncHandler(controller.send));
  router.get('/:chatId/messages', asyncHandler(controller.list));
  router.post('/:chatId/message/:messageId/read', asyncHandler(controller.markRead));
  router.post('/:chatId/lastseen', asyncHandler(controller.updateLastSeen));
  router.patch('/:chatId/message/:messageId', asyncHandler(controller.edit)); // bonus
  router.delete('/:chatId/message/:messageId', asyncHandler(controller.delete)); // bonus
  return router;
}
