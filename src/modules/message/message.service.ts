import { AppError } from '../../utils/AppError';
import { ChatService } from '../chat/chat.service';
import { MessageRepository } from './message.repository';
import { Message } from './message.types';

export class MessageService {
  constructor(
    private readonly chats: ChatService,
    private readonly messages: MessageRepository,
  ) {}

  async send(chatId: string, senderId: string, text: string): Promise<Message> {
    await this.chats.assertMember(chatId, senderId);
    return this.messages.create(chatId, senderId, text);
  }

  async list(chatId: string, limit: number, before?: string): Promise<Message[]> {
    await this.chats.assertChatExists(chatId);
    return this.messages.list(chatId, limit, before ? new Date(before) : undefined);
  }

  async markRead(chatId: string, messageId: string, userId: string): Promise<{ readAt: string }> {
    await this.chats.assertMember(chatId, userId);
    const readAt = await this.messages.markRead(chatId, messageId, userId);
    return { readAt };
  }

  async updateLastSeen(
    chatId: string,
    userId: string,
    messageId: string,
  ): Promise<{ updatedAt: string }> {
    await this.chats.assertMember(chatId, userId);
    await this.getMessageOrThrow(chatId, messageId);
    const updatedAt = await this.messages.setLastSeen(chatId, userId, messageId);
    return { updatedAt };
  }

  async edit(chatId: string, messageId: string, senderId: string, text: string): Promise<Message> {
    const message = await this.getOwnedMessage(chatId, messageId, senderId);
    if (message.isDeleted) throw AppError.badRequest('Cannot edit a deleted message');
    await this.messages.updateText(chatId, messageId, text);
    return this.getMessageOrThrow(chatId, messageId);
  }

  async delete(chatId: string, messageId: string, senderId: string): Promise<void> {
    await this.getOwnedMessage(chatId, messageId, senderId);
    await this.messages.softDelete(chatId, messageId);
  }

  private async getOwnedMessage(
    chatId: string,
    messageId: string,
    senderId: string,
  ): Promise<Message> {
    await this.chats.assertMember(chatId, senderId);
    const message = await this.getMessageOrThrow(chatId, messageId);
    if (message.senderId !== senderId) {
      throw AppError.forbidden('Only the sender can modify this message');
    }
    return message;
  }

  private async getMessageOrThrow(chatId: string, messageId: string): Promise<Message> {
    const message = await this.messages.findById(chatId, messageId);
    if (!message) throw AppError.notFound('Message not found');
    return message;
  }
}
