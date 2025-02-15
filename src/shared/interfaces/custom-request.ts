import { Request } from 'express';

export interface CustomRequest extends Request {
  user: {
    sub: string;
    email: string;
    username: string;
  };
}
