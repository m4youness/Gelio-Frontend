export class User {
  UserId?: number | null;
  Username?: string | null;
  Password?: string | null;
  CreatedDate?: string | null;
  IsActive?: boolean | null;
  ProfileImageId?: number | null;
  PersonID?: number | null;
}

export class UserWithProfileImage {
  User: User;
  Url: string | null;

  constructor(user: User, url: string | null = null) {
    this.User = user;
    this.Url = url;
  }
}
