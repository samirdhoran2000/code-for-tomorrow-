import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { UserController } from './user.controller';

export function createUserRouter(controller: UserController): Router {
  const router = Router();
  router.post('/', asyncHandler(controller.create));
  router.get('/', asyncHandler(controller.list));
  return router;
}
