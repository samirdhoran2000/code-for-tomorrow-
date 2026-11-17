import { UserRepository } from './user.repository';
import { User } from './user.types';

export class UserService {
  constructor(private readonly users: UserRepository) {}

  create(name: string): Promise<User> {
    return this.users.create(name);
  }

  list(): Promise<User[]> {
    return this.users.list();
  }
}
