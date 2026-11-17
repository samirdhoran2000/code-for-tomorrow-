import { AppError } from '../../utils/AppError';
import { UserRepository } from '../user/user.repository';
import { ChatRepository } from './chat.repository';
import { Chat } from './chat.types';

export class ChatService {
  constructor(
    private readonly chats: ChatRepository,
    private readonly users: UserRepository,
  ) {}

  async createOrGetDirectChat(userAId: string, userBId: string): Promise<string> {
    if (userAId === userBId) {
      throw AppError.badRequest('A chat requires two different users');
    }
    if (!(await this.users.existsAll([userAId, userBId]))) {
      throw AppError.notFound('One or both users do not exist');
    }
    const directKey = [userAId, userBId].sort().join(':');
    return this.chats.createOrGetDirect(directKey, [userAId, userBId]);
  }

  async createGroupChat(name: string, createdBy: string, memberIds: string[]): Promise<string> {
    const members = [...new Set([createdBy, ...memberIds])];
    if (members.length < 3) {
      throw AppError.badRequest('A group chat needs at least 3 distinct members');
    }
    if (!(await this.users.existsAll(members))) {
      throw AppError.notFound('One or more users do not exist');
    }
    return this.chats.createGroup(name, createdBy, members);
  }

  async addMember(chatId: string, requesterId: string, userId: string): Promise<void> {
    const chat = await this.getChatOrThrow(chatId);
    if (chat.type !== 'group') {
      throw AppError.badRequest('Members can only be added to group chats');
    }
    await this.assertMember(chatId, requesterId);
    if (!(await this.users.exists(userId))) {
      throw AppError.notFound('User does not exist');
    }
    await this.chats.addMember(chatId, userId);
  }

  async listUserChats(userId: string): Promise<Chat[]> {
    if (!(await this.users.exists(userId))) {
      throw AppError.notFound('User does not exist');
    }
    return this.chats.listByUser(userId);
  }

  async assertChatExists(chatId: string): Promise<void> {
    await this.getChatOrThrow(chatId);
  }

  async assertMember(chatId: string, userId: string): Promise<void> {
    await this.getChatOrThrow(chatId);
    if (!(await this.chats.isMember(chatId, userId))) {
      throw AppError.forbidden('User is not a member of this chat');
    }
  }

  private async getChatOrThrow(chatId: string): Promise<Chat> {
    const chat = await this.chats.findById(chatId);
    if (!chat) throw AppError.notFound('Chat not found');
    return chat;
  }
}
