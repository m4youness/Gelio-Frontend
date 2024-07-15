export class User {
  UserId?: number | null;
  Username?: string | null;
  Password?: string | null;
  CreatedDate?: string | null;
  IsActive?: boolean | null;
  ProfileImageId?: number | null;
  PersonID?: number | null;

  constructor(
    UserId?: number | null,
    Username?: string | null,
    ProfileImageId?: number | null,
  ) {
    this.UserId = UserId || null;
    this.Username = Username || null;
    this.ProfileImageId = ProfileImageId || null;
  }
}

export class UserWithProfileImage {
  User: User;
  Url: string | null;

  constructor(user: User, url: string | null = null) {
    this.User = user;
    this.Url = url;
  }
}
