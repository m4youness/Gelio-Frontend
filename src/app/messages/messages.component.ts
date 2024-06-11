import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
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
    private router: Router,
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

  receiverName: string = 'Unknown';

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

  GoToReceiversProfilePage() {
    this.router.navigate(['/profile', this.CurrentReceiverId]);
  }

  getMessageClass(senderId?: number | null): string {
    return senderId === this.CurrentUserId
      ? 'flex bg-blue-500 self-end'
      : 'bg-zinc-900';
  }

  async GetCurrentReceiverName(ReceiverId?: number | null) {
    if (!ReceiverId) return;
    const Receiver = await firstValueFrom(
      this.user_service.GetUser(ReceiverId),
    );
    if (!Receiver.Username) return;
    this.receiverName = Receiver.Username;
  }

  async AddContact() {
    if (!this.ContactForm.valid) {
      this.ContactForm.markAllAsTouched();
      return;
    }
    const Added = await firstValueFrom(
      this.message_service.AddContact(
        this.ContactForm.controls['Contact'].value,
        this.CurrentUserId,
      ),
    );

    if (!Added) {
      alert('Could not add contact');
      return;
    }
    this.ContactForm.controls['Contact'].setValue('');
    this.ContactModeOn();
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
    if (!this.messageContainer) return;

    // Debugging current scroll positions
    const { scrollTop, scrollHeight, clientHeight } =
      this.messageContainer.nativeElement;

    // Only scroll to the bottom if not already at the bottom
    if (scrollTop + clientHeight < scrollHeight) {
      this.messageContainer.nativeElement.scrollTop = scrollHeight;
    }
  }

  async SendMessage() {
    if (!this.MessageForm.valid) {
      this.MessageForm.markAllAsTouched();
      return;
    }

    try {
      const Sent = await firstValueFrom(
        this.message_service.SendMessage(
          this.CurrentUserId,
          this.CurrentReceiverId,
          this.MessageForm.controls['Message'].value,
          this.getCurrentDateTimeString(),
        ),
      );
      if (!Sent) {
        alert('err');
        return;
      }

      this.MessageForm.controls['Message'].setValue('');
      this.LoadMessage(this.CurrentReceiverId);
    } catch (err) {
      console.log(err);
    }
  }

  MessageInfo(MessageInfoId?: number | null): Promise<string> {
    return new Promise((resolve, reject) => {
      this.message_service.GetMessageInfo(MessageInfoId).subscribe(
        (data) => {
          if (data.Message) {
            console.log(data.SentDate);
            resolve(data.Message);
          }
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

    this.GetCurrentReceiverName(ReceiverId);
    this.CurrentReceiverId = ReceiverId;
    try {
      const Users = await firstValueFrom(
        this.message_service.LoadMessages(this.CurrentUserId, ReceiverId),
      );

      this.Messages = [];
      for (const e of Users) {
        const messageBody = await this.MessageInfo(e.MessageInfoId);

        this.Messages.push({
          Message: messageBody,
          SenderId: e.SenderId,
          ReceiverId: e.ReceiverId,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async LoadMessages() {
    try {
      const user_id = await firstValueFrom(this.user_service.CurrentUserId());

      this.CurrentUserId = user_id;
      this.Users = await firstValueFrom(
        this.message_service.LoadContacts(user_id),
      );
    } catch (err) {
      console.log(err);
    }
  }

  ngOnInit(): void {
    this.LoadMessages();
  }
}
