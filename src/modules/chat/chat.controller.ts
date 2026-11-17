import { Request, Response } from 'express';
import { ChatService } from './chat.service';
import {
  addMemberBody,
  chatIdParams,
  createChatBody,
  createGroupBody,
  userIdParams,
} from './chat.schema';

export class ChatController {
  constructor(private readonly service: ChatService) {}

  createOrGet = async (req: Request, res: Response): Promise<void> => {
    const { userAId, userBId } = createChatBody.parse(req.body);
    const chatId = await this.service.createOrGetDirectChat(userAId, userBId);
    res.status(200).json({ chatId });
  };

  createGroup = async (req: Request, res: Response): Promise<void> => {
    const { name, createdBy, memberIds } = createGroupBody.parse(req.body);
    const chatId = await this.service.createGroupChat(name, createdBy, memberIds);
    res.status(201).json({ chatId });
  };

  addMember = async (req: Request, res: Response): Promise<void> => {
    const { chatId } = chatIdParams.parse(req.params);
    const { requesterId, userId } = addMemberBody.parse(req.body);
    await this.service.addMember(chatId, requesterId, userId);
    res.status(204).send();
  };

  listUserChats = async (req: Request, res: Response): Promise<void> => {
    const { userId } = userIdParams.parse(req.params);
    const chats = await this.service.listUserChats(userId);
    res.status(200).json({ chats });
  };
}
