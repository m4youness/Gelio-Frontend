import { UserWithProfileImage } from './user';

export class Comments {
  CommentId?: number | null;
  PostId?: number | null;
  UserId?: number | null;
  Message?: string | null;
  CreatedDate?: string | null;

  constructor(
    postId?: number | null,
    userId?: number | null,
    message?: string | null,
    createdDate?: string | null,
  ) {
    this.PostId = postId;
    this.UserId = userId;
    this.Message = message;
    this.CreatedDate = createdDate;
  }
}

export class CommentDetails {
  Comment: Comments;
  User: UserWithProfileImage;

  constructor(comment: Comments, user: UserWithProfileImage) {
    this.Comment = comment;
    this.User = user;
  }
}
