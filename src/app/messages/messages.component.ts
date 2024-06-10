import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewChild, ElementRef, AfterViewChecked } from '@angular/core';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
})
export class MessagesComponent implements OnInit, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  constructor(
    private message_service: MessageService,
    private user_service: UserService,
  ) {
    this.MessageForm = new FormGroup({
      Message: new FormControl('', [Validators.required]),
    });

    this.ContactForm = new FormGroup({
      Contact: new FormControl('', [Validators.required]),
    });
  }

  MessageModeOn: boolean = false;
  ContactMode: boolean = false;

  MessageForm: FormGroup;
  ContactForm: FormGroup;

  pageName: string = 'messages';
  Users: User[] = [];
  Messages: {
    Message: string;
    SenderId?: number | null;
    ReceiverId?: number | null;
  }[] = [];

  CurrentUserId?: number | null;
  CurrentReceiverId?: number | null;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ExpandMessagePanel() {
    this.MessageModeOn = false;
  }

  ContactModeOn() {
    this.ContactMode = !this.ContactMode;

    this.LoadMessages();
  }

  getMessageClass(senderId?: number | null): string {
    return senderId === this.CurrentUserId
      ? 'flex bg-blue-500 self-end'
      : 'bg-zinc-900';
  }

  async AddContact() {
    if (!this.ContactForm.valid) {
      this.ContactForm.markAllAsTouched();
      return;
    }
    this.message_service
      .AddContact(
        this.ContactForm.controls['Contact'].value,
        this.CurrentUserId,
      )
      .subscribe(
        (data) => {
          if (!data) {
            alert('Contact was not added');
            return;
          }
          this.ContactForm.controls['Contact'].setValue('');

          this.ContactModeOn();
        },
        (err) => {
          console.log(err);
        },
      );
  }

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

  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop =
        this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
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
            if (!data) {
              alert('err');
              return;
            } else {
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
    setTimeout(() => {
      this.MessageModeOn = true;
      try {
        this.CurrentReceiverId = ReceiverId;
        this.message_service
          .LoadMessages(this.CurrentUserId, ReceiverId)
          .subscribe(
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
    }, 25);
  }

  async LoadMessages() {
    try {
      const user_id = await this.user_service.CurrentUserId().toPromise();

      this.CurrentUserId = user_id;
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

  ngOnInit(): void {
    this.LoadMessages();
  }
}
