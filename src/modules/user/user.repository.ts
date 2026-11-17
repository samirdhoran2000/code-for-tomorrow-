import { pool } from '../../db/pool';
import { User } from './user.types';

interface UserRow {
  id: string;
  name: string;
  created_at: Date;
}

const toUser = (row: UserRow): User => ({ id: row.id, name: row.name, createdAt: row.created_at });

export class UserRepository {
  async create(name: string): Promise<User> {
    const { rows } = await pool.query<UserRow>(
      'INSERT INTO users (name) VALUES ($1) RETURNING id, name, created_at',
      [name],
    );
    return toUser(rows[0]);
  }

  async existsAll(ids: string[]): Promise<boolean> {
    const unique = [...new Set(ids)];
    const { rows } = await pool.query<{ count: number }>(
      'SELECT COUNT(*)::int AS count FROM users WHERE id = ANY($1::uuid[])',
      [unique],
    );
    return rows[0].count === unique.length;
  }

  async exists(id: string): Promise<boolean> {
    return this.existsAll([id]);
  }
}
