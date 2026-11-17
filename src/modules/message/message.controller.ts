import { Request, Response } from 'express';
import { MessageService } from './message.service';
import {
  chatIdParams,
  deleteMessageBody,
  editMessageBody,
  getMessagesQuery,
  lastSeenBody,
  markReadBody,
  messageParams,
  sendMessageBody,
} from './message.schema';

export class MessageController {
  constructor(private readonly service: MessageService) {}

  send = async (req: Request, res: Response): Promise<void> => {
    const { chatId } = chatIdParams.parse(req.params);
    const { senderId, text } = sendMessageBody.parse(req.body);
    const message = await this.service.send(chatId, senderId, text);
    res.status(201).json(message);
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const { chatId } = chatIdParams.parse(req.params);
    const { limit, before } = getMessagesQuery.parse(req.query);
    const messages = await this.service.list(chatId, limit, before);
    res.status(200).json({ messages });
  };

  markRead = async (req: Request, res: Response): Promise<void> => {
    const { chatId, messageId } = messageParams.parse(req.params);
    const { userId } = markReadBody.parse(req.body);
    const result = await this.service.markRead(chatId, messageId, userId);
    res.status(200).json({ chatId, messageId, userId, ...result });
  };

  updateLastSeen = async (req: Request, res: Response): Promise<void> => {
    const { chatId } = chatIdParams.parse(req.params);
    const { userId, messageId } = lastSeenBody.parse(req.body);
    const result = await this.service.updateLastSeen(chatId, userId, messageId);
    res.status(200).json({ chatId, userId, messageId, ...result });
  };

  edit = async (req: Request, res: Response): Promise<void> => {
    const { chatId, messageId } = messageParams.parse(req.params);
    const { senderId, text } = editMessageBody.parse(req.body);
    const message = await this.service.edit(chatId, messageId, senderId, text);
    res.status(200).json(message);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const { chatId, messageId } = messageParams.parse(req.params);
    const { senderId } = deleteMessageBody.parse(req.body);
    await this.service.delete(chatId, messageId, senderId);
    res.status(204).send();
  };
}
