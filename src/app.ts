import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import { controllers } from './container';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { createChatRouter, createUserChatsRouter } from './modules/chat/chat.routes';
import { createMessageRouter } from './modules/message/message.routes';
import { createUserRouter } from './modules/user/user.routes';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/users', createUserRouter(controllers.user));
  app.use('/user', createUserChatsRouter(controllers.chat));
  app.use('/chat', createChatRouter(controllers.chat));
  app.use('/chat', createMessageRouter(controllers.message));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
