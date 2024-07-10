import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { firstValueFrom } from 'rxjs';
import { DateUtilService } from '../../services/date-util.service';
import { UserService } from '../../services/user.service';
import { Post } from '../../models/post';
import { CloudinaryService } from '../../services/cloudinary.service';
import { NgxImageCompressService } from 'ngx-image-compress';
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
    private imageCompress: NgxImageCompressService,
  ) {
    this.UploadGroup = new FormGroup({
      description: new FormControl('', [
        Validators.required,
        Validators.maxLength(500),
      ]),
    });
  }

  UploadGroup: FormGroup;
  ButtonPressed: boolean = false;

  async Upload() {
    this.ButtonPressed = true;
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
      }
    } catch (err) {
      console.log(err);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;

        this.imageCompress
          .compressFile(
            base64String,
            -1, // orientation
            70, // compress quality (0-100)
            400, // max width
            400, // max height
          )
          .then((result: string) => {
            const byteString = atob(result.split(',')[1]);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const int8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
              int8Array[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([int8Array], { type: 'image/jpeg' });
            this.file = new File([blob], file.name, { type: 'image/jpeg' });
          });
      };
      reader.readAsDataURL(file);
    }
  }
}
