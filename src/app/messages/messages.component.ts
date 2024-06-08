import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
})
export class MessagesComponent implements OnInit {
  pageName: string = 'messages';
  Users: User[] = [];
  MessageModeOn: boolean = false;
  Messages: {
    Message: string;
    SenderId?: number | null;
    ReceiverId?: number | null;
  }[] = [];

  CurrentUserId?: number | null;
  CurrentReceiverId?: number | null;

  getCurrentDateTimeString(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  constructor(
    private message_service: MessageService,
    private user_service: UserService,
  ) {
    this.MessageForm = new FormGroup({
      Message: new FormControl('', [Validators.required]),
    });
  }

  MessageForm: FormGroup;

  getMessageClass(senderId?: number | null): string {
    return senderId === this.CurrentUserId
      ? 'flex bg-blue-500 self-end'
      : 'bg-zinc-900';
  }

  SendMessage() {
    if (this.MessageForm.valid) {
      this.message_service
        .SendMessage(
          this.CurrentUserId,
          this.CurrentReceiverId,
          this.MessageForm.controls['Message'].value,
          this.getCurrentDateTimeString(),
        )
        .subscribe(
          (data) => {
            if (!data) alert('an error occured');
            else {
              this.MessageForm.controls['Message'].setValue('');
              this.LoadMessage(this.CurrentReceiverId);
            }
          },
          (err) => {
            console.log(err);
          },
        );
    } else {
      this.MessageForm.markAllAsTouched();
    }
  }

  MessageInfo(MessageInfoId?: number | null): Promise<string> {
    return new Promise((resolve, reject) => {
      this.message_service.GetMessageInfo(MessageInfoId).subscribe(
        (data) => {
          if (data.Message) resolve(data.Message);
        },
        (err) => {
          console.log(err);
          reject(err);
        },
      );
    });
  }

  async LoadMessage(ReceiverId?: number | null) {
    this.MessageModeOn = true;
    try {
      const SenderId = await this.user_service.CurrentUserId().toPromise();
      this.CurrentReceiverId = ReceiverId;
      this.CurrentUserId = SenderId;
      this.message_service.LoadMessages(SenderId, ReceiverId).subscribe(
        async (data) => {
          this.Messages = [];
          for (const e of data) {
            const messageBody = await this.MessageInfo(e.MessageInfoId);
            this.Messages.push({
              Message: messageBody,
              SenderId: e.SenderId,
              ReceiverId: e.ReceiverId,
            });
          }
        },
        (err) => {
          console.log(err);
        },
      );
    } catch (err) {
      console.log(err);
    }
  }

  async ngOnInit() {
    try {
      const user_id = await this.user_service.CurrentUserId().toPromise();
      this.message_service.LoadContacts(user_id).subscribe(
        (data) => {
          this.Users = data;
        },
        (err) => {
          console.log(err);
        },
      );
    } catch (err) {
      console.log(err);
    }
  }
}
