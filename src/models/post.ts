import { User } from './user';

export class Post {
  PostId?: number | null;
  Body?: string | null;
  UserId?: number | null;
  CreatedDate?: string | null;
  ImageId?: number | null;
}

export class PostWithImage {
  Post: Post = {};
  User: User = {};
  ImageUrl?: string | null;
  ProfileUrl?: string | null;
  IsLiked: Boolean = false;
  Likes: number = 0;
}
