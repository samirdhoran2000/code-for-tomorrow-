import { PoolClient } from 'pg';
import { pool, withTransaction } from '../../db/pool';
import { Chat, ChatType } from './chat.types';

interface ChatRow {
  id: string;
  type: ChatType;
  name: string | null;
  created_at: Date;
  member_ids: string[];
}

const toChat = (row: ChatRow): Chat => ({
  id: row.id,
  type: row.type,
  name: row.name,
  createdAt: row.created_at,
  memberIds: row.member_ids,
});

const CHAT_WITH_MEMBERS = `
  SELECT c.id, c.type, c.name, c.created_at,
         array_agg(m.user_id::text ORDER BY m.joined_at, m.user_id)::text[] AS member_ids
  FROM chats c
  JOIN chat_members m ON m.chat_id = c.id
`;

export class ChatRepository {
  async findById(chatId: string): Promise<Chat | null> {
    const { rows } = await pool.query<ChatRow>(
      `${CHAT_WITH_MEMBERS} WHERE c.id = $1 GROUP BY c.id`,
      [chatId],
    );
    return rows[0] ? toChat(rows[0]) : null;
  }

  async createOrGetDirect(directKey: string, userIds: [string, string]): Promise<string> {
    return withTransaction(async (client) => {
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO chats (type, direct_key) VALUES ('direct', $1)
         ON CONFLICT (direct_key) DO NOTHING RETURNING id`,
        [directKey],
      );
      if (inserted.rows[0]) {
        await this.insertMembers(client, inserted.rows[0].id, userIds);
        return inserted.rows[0].id;
      }
      const existing = await client.query<{ id: string }>(
        'SELECT id FROM chats WHERE direct_key = $1',
        [directKey],
      );
      return existing.rows[0].id;
    });
  }

  async createGroup(name: string, createdBy: string, memberIds: string[]): Promise<string> {
    return withTransaction(async (client) => {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO chats (type, name, created_by) VALUES ('group', $1, $2) RETURNING id`,
        [name, createdBy],
      );
      await this.insertMembers(client, rows[0].id, memberIds);
      return rows[0].id;
    });
  }

  async addMember(chatId: string, userId: string): Promise<void> {
    await pool.query(
      'INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [chatId, userId],
    );
  }

  async isMember(chatId: string, userId: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      'SELECT 1 FROM chat_members WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId],
    );
    return (rowCount ?? 0) > 0;
  }

  async listByUser(userId: string): Promise<Chat[]> {
    const { rows } = await pool.query<ChatRow>(
      `${CHAT_WITH_MEMBERS}
       WHERE c.id IN (SELECT chat_id FROM chat_members WHERE user_id = $1)
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [userId],
    );
    return rows.map(toChat);
  }

  private async insertMembers(client: PoolClient, chatId: string, userIds: string[]): Promise<void> {
    await client.query(
      `INSERT INTO chat_members (chat_id, user_id)
       SELECT $1, unnest($2::uuid[]) ON CONFLICT DO NOTHING`,
      [chatId, [...new Set(userIds)]],
    );
  }
}
