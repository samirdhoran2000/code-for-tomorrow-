import { Request, Response } from 'express';
import { UserService } from './user.service';
import { createUserBody } from './user.schema';

export class UserController {
  constructor(private readonly service: UserService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { name } = createUserBody.parse(req.body);
    const user = await this.service.create(name);
    res.status(201).json(user);
  };
}
