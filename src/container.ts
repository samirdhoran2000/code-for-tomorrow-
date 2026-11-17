import { ChatController } from './modules/chat/chat.controller';
import { ChatRepository } from './modules/chat/chat.repository';
import { ChatService } from './modules/chat/chat.service';
import { MessageController } from './modules/message/message.controller';
import { MessageRepository } from './modules/message/message.repository';
import { MessageService } from './modules/message/message.service';
import { UserController } from './modules/user/user.controller';
import { UserRepository } from './modules/user/user.repository';
import { UserService } from './modules/user/user.service';

const userRepository = new UserRepository();
const chatRepository = new ChatRepository();
const messageRepository = new MessageRepository();

const userService = new UserService(userRepository);
const chatService = new ChatService(chatRepository, userRepository);
const messageService = new MessageService(chatService, messageRepository);

export const controllers = {
  user: new UserController(userService),
  chat: new ChatController(chatService),
  message: new MessageController(messageService),
};
