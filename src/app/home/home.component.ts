import { Component, OnInit } from '@angular/core';
import { Post, PostDetails } from '../../models/post';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { firstValueFrom } from 'rxjs';
import { CloudinaryService } from '../../services/cloudinary.service';
import { DateUtilService } from '../../services/date-util.service';
import { PostLikesService } from '../../services/post-likes.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  pageName: string = 'home';
  constructor(
    private user_service: UserService,
    private post_service: PostService,
    private cloudinary_service: CloudinaryService,
    private date_util_service: DateUtilService,
    private post_likes_service: PostLikesService,
  ) {}

  Posts: PostDetails[] = [];

  CurrentUserId?: number | null;

  async Like(i: number) {
    try {
      this.Posts[i].IsLiked = !this.Posts[i].IsLiked;
      const PostId = this.Posts[i].Post.PostId;

      if (!PostId || !this.CurrentUserId) return;

      if (this.Posts[i].IsLiked) {
        await firstValueFrom(
          this.post_likes_service.AddLike(PostId, this.CurrentUserId),
        );
      } else {
        await firstValueFrom(
          this.post_likes_service.RemoveLike(PostId, this.CurrentUserId),
        );
      }

      this.Posts[i].Likes = await firstValueFrom(
        this.post_likes_service.GetAmountOfLikes(PostId),
      );
    } catch (err) {
      console.log(err);
    }
  }

  ngOnInit() {
    this.GetPosts();
  }

  async GetPosts() {
    try {
      this.CurrentUserId = await firstValueFrom(
        this.user_service.CurrentUserId(),
      );
      const Posts: Post[] = await firstValueFrom(
        this.post_service.GetPosts(this.CurrentUserId),
      );

      console.log(Posts);

      for (let post of Posts) {
        if (post.ImageId && post.UserId && post.PostId) {
          const Image = await firstValueFrom(
            this.cloudinary_service.findImage(post.ImageId),
          );
          const user = await firstValueFrom(
            this.user_service.GetUser(post.UserId),
          );
          if (!user.ProfileImageId) return;
          const Profile = await firstValueFrom(
            this.cloudinary_service.findImage(user.ProfileImageId),
          );
          if (!post.CreatedDate) return;
          const date = this.date_util_service.getRelativeTime(post.CreatedDate);

          post.CreatedDate = date;

          const IsLiked = await firstValueFrom(
            this.post_likes_service.IsPostLiked(
              post.PostId,
              this.CurrentUserId,
            ),
          );
          const Likes = await firstValueFrom(
            this.post_likes_service.GetAmountOfLikes(post.PostId),
          );

          const Post = new PostDetails(
            post,
            user,
            Image.Url,
            Profile.Url,
            IsLiked,
            Likes,
          );

          this.Posts.push(Post);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
}
