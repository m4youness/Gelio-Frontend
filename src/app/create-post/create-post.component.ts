import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { firstValueFrom } from 'rxjs';
import { DateUtilService } from '../../services/date-util.service';
import { UserService } from '../../services/user.service';
import { Post } from '../../models/post';
import { CloudinaryService } from '../../services/cloudinary.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.css',
})
export class CreatePostComponent {
  pageName: string = 'create';
  file: File | null = null;
  loading: boolean = false;

  constructor(
    private post_service: PostService,
    private date_util_service: DateUtilService,
    private user_service: UserService,
    private cloudinary_service: CloudinaryService,
    private router: Router,
  ) {
    this.UploadGroup = new FormGroup({
      description: new FormControl('', [
        Validators.required,
        Validators.maxLength(500),
      ]),
    });
  }

  UploadGroup: FormGroup;

  async Upload() {
    if (!this.UploadGroup.valid) {
      this.UploadGroup.markAllAsTouched();
      return;
    }

    try {
      if (this.file) {
        this.loading = true;
        const UserId = await firstValueFrom(this.user_service.CurrentUserId());
        const ImageId = await firstValueFrom(
          this.cloudinary_service.uploadImage(this.file),
        );
        const post = new Post(
          this.UploadGroup.controls['description'].value,
          UserId,
          this.date_util_service.getCurrentDateTimeString(),
          ImageId,
        );
        await firstValueFrom(this.post_service.UploadPost(post));
        this.loading = false;
        this.router.navigate(['/home']);
      } else {
        alert('Please select a file');
      }
    } catch (err) {
      console.log(err);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
    }
  }
}
