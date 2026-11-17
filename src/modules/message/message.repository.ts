import {
  CollectionReference,
  DocumentReference,
  FieldPath,
  Query,
  Timestamp,
} from 'firebase-admin/firestore';
import { firestore } from '../../config/firebase';
import { AppError } from '../../utils/AppError';
import { LastSeenDoc, Message, MessageDoc } from './message.types';

const messagesCol = (chatId: string): CollectionReference =>
  firestore.collection('chats').doc(chatId).collection('messages');

const messageRef = (chatId: string, messageId: string): DocumentReference =>
  messagesCol(chatId).doc(messageId);

const lastSeenRef = (chatId: string, userId: string): DocumentReference =>
  firestore.collection('chats').doc(chatId).collection('lastSeen').doc(userId);

const iso = (ts: Timestamp): string => ts.toDate().toISOString();

const toMessage = (id: string, chatId: string, d: MessageDoc): Message => ({
  id,
  chatId,
  senderId: d.senderId,
  text: d.isDeleted ? '' : d.text,
  createdAt: iso(d.createdAt),
  editedAt: d.editedAt ? iso(d.editedAt) : null,
  isDeleted: d.isDeleted,
  readBy: Object.fromEntries(Object.entries(d.readBy ?? {}).map(([uid, ts]) => [uid, iso(ts)])),
});

export class MessageRepository {
  async create(chatId: string, senderId: string, text: string): Promise<Message> {
    const ref = messagesCol(chatId).doc();
    const doc: MessageDoc = {
      senderId,
      text,
      createdAt: Timestamp.now(),
      editedAt: null,
      isDeleted: false,
      readBy: {},
    };
    await ref.set(doc);
    return toMessage(ref.id, chatId, doc);
  }

  async findById(chatId: string, messageId: string): Promise<Message | null> {
    const snap = await messageRef(chatId, messageId).get();
    return snap.exists ? toMessage(snap.id, chatId, snap.data() as MessageDoc) : null;
  }

  async list(chatId: string, limit: number, before?: Date): Promise<Message[]> {
    let query: Query = messagesCol(chatId).orderBy('createdAt', 'desc').limit(limit);
    if (before) query = query.startAfter(Timestamp.fromDate(before));
    const snap = await query.get();
    return snap.docs.map((d) => toMessage(d.id, chatId, d.data() as MessageDoc)).reverse();
  }

  async markRead(chatId: string, messageId: string, userId: string): Promise<string> {
    const ref = messageRef(chatId, messageId);
    const readAt = await firestore.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw AppError.notFound('Message not found');
      const data = snap.data() as MessageDoc;
      if (data.senderId === userId) {
        throw AppError.badRequest('Sender cannot mark their own message as read');
      }
      const existing = data.readBy?.[userId];
      if (existing) return existing;
      const now = Timestamp.now();
      tx.update(ref, new FieldPath('readBy', userId), now);
      return now;
    });
    return iso(readAt);
  }

  async setLastSeen(chatId: string, userId: string, messageId: string): Promise<string> {
    const updatedAt = Timestamp.now();
    const doc: LastSeenDoc = { messageId, updatedAt };
    await lastSeenRef(chatId, userId).set(doc);
    return iso(updatedAt);
  }

  async updateText(chatId: string, messageId: string, text: string): Promise<void> {
    await messageRef(chatId, messageId).update({ text, editedAt: Timestamp.now() });
  }

  async softDelete(chatId: string, messageId: string): Promise<void> {
    await messageRef(chatId, messageId).update({ isDeleted: true, text: '' });
  }
}
