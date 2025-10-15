import { SelectedUser } from '../selectors/user.selectors';

declare module 'express' {
  interface Request {
    user?: SelectedUser;
  }
}
