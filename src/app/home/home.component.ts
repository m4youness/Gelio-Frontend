import { Component, OnInit } from '@angular/core';
import { Post, PostDetails } from '../../models/post';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';
import { firstValueFrom } from 'rxjs';
import { CloudinaryService } from '../../services/cloudinary.service';
import { DateUtilService } from '../../services/date-util.service';
import { PostLikesService } from '../../services/post-likes.service';
import { CommentsService } from '../../services/comments.service';
import { CommentDetails, Comments } from '../../models/comments';
import { UserWithProfileImage } from '../../models/user';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  pageName: string = 'home';
  Loaded: boolean = false;

  constructor(
    private user_service: UserService,
    private post_service: PostService,
    private cloudinary_service: CloudinaryService,
    private date_util_service: DateUtilService,
    private post_likes_service: PostLikesService,
    private comments_service: CommentsService,
  ) {
    this.CommentsGroup = new FormGroup({
      comment: new FormControl('', [
        Validators.required,
        Validators.maxLength(500),
      ]),
    });
  }

  Posts: PostDetails[] = [];
  Comments: CommentDetails[] = [];

  CurrentUserId?: number | null;
  CommentsOn: boolean = false;

  CommentsGroup: FormGroup;

  CloseComments() {
    this.CommentsOn = false;
  }

  async AddComment(i: number) {
    if (!this.CommentsGroup.valid) return;

    try {
      const comment = new Comments(
        this.Posts[i].Post.PostId,
        this.CurrentUserId,
        this.CommentsGroup.controls['comment'].value,
        this.date_util_service.getCurrentDateTimeString(),
      );
      await firstValueFrom(this.comments_service.AddComment(comment));
      this.CommentsGroup.controls['comment'].setValue('');
    } catch (err) {
      console.log(err);
    }
  }

  async OpenComments(i: number) {
    this.CommentsOn = true;
    this.Comments = [];
    try {
      const Comments = await firstValueFrom(
        this.comments_service.GetComments(this.Posts[i].Post.PostId),
      );

      for (let Comment of Comments) {
        if (!Comment.UserId) return;
        const User = await firstValueFrom(
          this.user_service.GetUser(Comment.UserId),
        );
        if (!User.ProfileImageId) {
          return;
        }

        if (User.ProfileImageId == 2) {
          const userWithProfileImage = new UserWithProfileImage(
            User,
            'https://res.cloudinary.com/geliobackend/image/upload/v1720033720/profile-icon-design-free-vector.jpg.jpg',
          );

          const commentDetails = new CommentDetails(
            Comment,
            userWithProfileImage,
          );

          this.Comments.push(commentDetails);
          return;
        }

        const Image = await firstValueFrom(
          this.cloudinary_service.findImage(User.ProfileImageId),
        );

        const userWithProfileImage = new UserWithProfileImage(User, Image.Url);

        const commentDetails = new CommentDetails(
          Comment,
          userWithProfileImage,
        );
        this.Comments.push(commentDetails);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async Like(i: number) {
    try {
      this.Posts[i].IsLiked = !this.Posts[i].IsLiked;
      const PostId = this.Posts[i].Post.PostId;

      if (!PostId || !this.CurrentUserId) return;

      if (this.Posts[i].IsLiked) {
        this.Posts[i].Likes++;
        await firstValueFrom(
          this.post_likes_service.AddLike(PostId, this.CurrentUserId),
        );
      } else {
        this.Posts[i].Likes--;
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

      for (let post of Posts) {
        if (post.ImageId && post.UserId && post.PostId) {
          const Image = await firstValueFrom(
            this.cloudinary_service.findImage(post.ImageId),
          );
          const user = await firstValueFrom(
            this.user_service.GetUser(post.UserId),
          );
          if (!user.ProfileImageId) {
            return;
          }

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

          if (user.ProfileImageId == 2) {
            const ProfileUrl =
              'https://res.cloudinary.com/geliobackend/image/upload/v1720033720/profile-icon-design-free-vector.jpg.jpg';

            const Post = new PostDetails(
              post,
              user,
              Image.Url,
              ProfileUrl,
              IsLiked,
              Likes,
            );

            this.Posts.push(Post);

            continue;
          }

          const Profile = await firstValueFrom(
            this.cloudinary_service.findImage(user.ProfileImageId),
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

      this.Loaded = true;
    } catch (err) {
      console.log(err);
    }
  }
}
