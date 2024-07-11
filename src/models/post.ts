import { User } from './user';

export class Post {
  PostId?: number | null;
  Body?: string | null;
  UserId?: number | null;
  CreatedDate?: string | null;
  ImageId?: number | null;

  constructor(
    body: string,
    userId: number,
    createdDate: string,
    imageId: number,
  ) {
    this.Body = body;
    this.UserId = userId;
    this.CreatedDate = createdDate;
    this.ImageId = imageId;
  }
}

export class PostDetails {
  Post: Post;
  User: User;
  ImageUrl: string | null;
  ProfileUrl: string | null;
  IsLiked: boolean;
  Likes: number;

  constructor(
    post: Post,
    user: User,
    imageUrl: string | null = null,
    profileUrl: string | null = null,
    isLiked: boolean = false,
    likes: number = 0,
  ) {
    this.Post = post;
    this.User = user;
    this.ImageUrl = imageUrl;
    this.ProfileUrl = profileUrl;
    this.IsLiked = isLiked;
    this.Likes = likes;
  }
}
