import { Component, HostListener, OnInit } from '@angular/core';
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
  PostsLoaded: boolean = true;
  CommentsLoaded: boolean = false;
  NoComments: boolean = false;

  Limit: number = 2;
  Offset: number = 0;

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
      this.NoComments = false;
      await firstValueFrom(this.comments_service.AddComment(comment));
      this.CommentsGroup.controls['comment'].setValue('');
    } catch (err) {
      console.log(err);
    }
  }

  async OpenComments(i: number) {
    this.CommentsOn = true;
    this.CommentsLoaded = false;
    this.Comments = [];
    try {
      const Comments = await firstValueFrom(
        this.comments_service.GetComments(this.Posts[i].Post.PostId),
      );

      if (!Comments) {
        this.CommentsLoaded = true;
        this.NoComments = true;
        return;
      } else {
        this.NoComments = false;
      }

      const commentDetailsPromises = Comments.map(async (Comment) => {
        if (!Comment.UserId) return null;

        const user = await firstValueFrom(
          this.user_service.GetUser(Comment.UserId),
        );
        if (!user.ProfileImageId) return null;

        let userProfile = '';

        if (user.ProfileImageId === 2) {
          userProfile =
            'https://res.cloudinary.com/geliobackend/image/upload/v1720033720/profile-icon-design-free-vector.jpg.jpg';
        } else {
          const image = await firstValueFrom(
            this.cloudinary_service.findImage(user.ProfileImageId),
          );
          userProfile = image?.Url || '';
        }

        const userWithProfileImage = new UserWithProfileImage(
          user,
          userProfile,
        );
        return new CommentDetails(Comment, userWithProfileImage);
      });

      const commentDetails = await Promise.all(commentDetailsPromises);

      // Filter out null values and assign to this.Comments
      this.Comments = commentDetails.filter(
        (detail): detail is CommentDetails => detail !== null,
      );

      this.CommentsLoaded = true;
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
        this.post_service.GetPosts(this.CurrentUserId, this.Offset, this.Limit),
      );

      this.Offset += this.Limit

      if (!Posts) {
        this.PostsLoaded = true;
        return;
      }

      const postDetailsPromises = Posts.map(async (post) => {
        if (post.ImageId && post.UserId && post.PostId && this.CurrentUserId) {
          const [image, user, isLiked, likes] = await Promise.all([
            firstValueFrom(this.cloudinary_service.findImage(post.ImageId)),
            firstValueFrom(this.user_service.GetUser(post.UserId)),
            firstValueFrom(
              this.post_likes_service.IsPostLiked(
                post.PostId,
                this.CurrentUserId,
              ),
            ),
            firstValueFrom(
              this.post_likes_service.GetAmountOfLikes(post.PostId),
            ),
          ]);

          if (!user.ProfileImageId || !post.CreatedDate) {
            return null; // Skip this post if user profile image or created date is missing
          }

          const date = this.date_util_service.getRelativeTime(post.CreatedDate);
          post.CreatedDate = date;

          let profileUrl = '';

          if (user.ProfileImageId === 2) {
            profileUrl =
              'https://res.cloudinary.com/geliobackend/image/upload/v1720033720/profile-icon-design-free-vector.jpg.jpg';
          } else {
            const profileImage = await firstValueFrom(
              this.cloudinary_service.findImage(user.ProfileImageId),
            );
            if (profileImage.Url) {
              profileUrl = profileImage.Url;
            }
          }

          return new PostDetails(
            post,
            user,
            image.Url,
            profileUrl,
            isLiked,
            likes,
          );
        }
        return null; 
      });

      // Wait for all post details to be fetched and filtered
      const postDetails = await Promise.all(postDetailsPromises);
      this.Posts = postDetails.filter(
        (detail): detail is PostDetails => detail !== null,
      );

      this.PostsLoaded = true;
    } catch (err) {
      console.log(err);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) {
      this.GetPosts();
    }
  }
}
