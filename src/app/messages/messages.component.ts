import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';
import { User, UserWithProfileImage } from '../../models/user';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { Message } from '../../models/Message';
import { CloudinaryService } from '../../services/cloudinary.service';
import { DateUtilService } from '../../services/date-util.service';
import { ApiUrl } from '../../enviroment/ApiUrl';

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
    private cloudinary_service: CloudinaryService,
    private date_util_service: DateUtilService,
    private router: Router,
  ) {
    this.MessageForm = new FormGroup({
      Message: new FormControl('', [Validators.required]),
    });

    this.ContactForm = new FormGroup({
      Contact: new FormControl('', [Validators.required]),
    });
  }

  socket?: WebSocket | null;

  MessageModeOn: boolean = false;
  ContactMode: boolean = false;

  receiverName: string = 'Unknown';
  pageName: string = 'messages';

  MessageForm: FormGroup;
  ContactForm: FormGroup;

  Users: UserWithProfileImage[] = [];
  Messages: Message[] = [];

  CurrentUserId?: number | null;
  CurrentReceiverId?: number | null;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ConnectToSockets() {
    const Socket = new WebSocket(
      'ws://glistening-respect-production.up.railway.app/ws',
    );
    console.log(Socket);

    Socket.addEventListener('open', () => {
      Socket.send(`${this.CurrentUserId}-${this.CurrentReceiverId}`);
    });

    // Listen for messages
    Socket.addEventListener('message', (event) => {
      this.Messages.push({
        SenderId: this.CurrentReceiverId,
        ReceiverId: this.CurrentUserId,
        MessageBody: event.data,
        SentDate: this.date_util_service.getCurrentDateTimeString(),
      });
    });

    this.socket = Socket;
  }

  ExpandMessagePanel() {
    this.MessageModeOn = false;
  }

  ContactModeOn() {
    this.ContactMode = !this.ContactMode;
    this.LoadContacts();
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
    try {
      if (!ReceiverId) return;
      const Receiver = await firstValueFrom(
        this.user_service.GetUser(ReceiverId),
      );
      if (!Receiver.Username) return;
      this.receiverName = Receiver.Username;
    } catch (err) {
      console.log(err);
    }
  }

  async AddContact() {
    try {
      if (!this.ContactForm.valid) {
        this.ContactForm.markAllAsTouched();
        return;
      }
      if (!this.CurrentUserId) return;
      const Added = await firstValueFrom(
        this.message_service.AddContact(
          this.ContactForm.controls['Contact'].value,
          this.CurrentUserId,
        ),
      );

      if (Added) {
        this.ContactForm.controls['Contact'].setValue('');
        this.ContactModeOn();
      } else {
        alert('Could not add contact');
        return;
      }
    } catch (err) {
      console.log(err);
      alert("Couldn't add contact");
    }
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
      if (!this.CurrentUserId || !this.CurrentReceiverId) return;
      const msg = this.MessageForm.controls['Message'].value;

      const Sent = await firstValueFrom(
        this.message_service.SendMessage(
          this.CurrentUserId,
          this.CurrentReceiverId,
          msg,
          this.date_util_service.getCurrentDateTimeString(),
        ),
      );
      if (!Sent) {
        alert('err');
        return;
      }

      this.socket?.send(msg);
      this.MessageForm.controls['Message'].setValue('');
      this.LoadMessage(this.CurrentReceiverId, true);
    } catch (err) {
      console.log(err);
    }
  }

  async LoadMessage(ReceiverId?: number | null, IsMessaging: boolean = false) {
    if (!IsMessaging) this.GetCurrentReceiverName(ReceiverId);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.MessageModeOn = true;

    this.CurrentReceiverId = ReceiverId;

    if (!this.CurrentUserId || !ReceiverId) return;
    try {
      this.Messages = [];
      this.Messages = await firstValueFrom(
        this.message_service.LoadMessages(this.CurrentUserId, ReceiverId),
      );

      this.ConnectToSockets();
    } catch (err) {
      console.log(err);
    }
  }

  async LoadContacts() {
    this.Users = [];
    try {
      const user_id = await firstValueFrom(this.user_service.CurrentUserId());

      this.CurrentUserId = user_id;
      const Users: User[] = await firstValueFrom(
        this.message_service.LoadContacts(user_id),
      );

      for (let user of Users) {
        if (!user.ProfileImageId) {
          return;
        }

        if (user.ProfileImageId == 2) {
          const ProfileUrl =
            'https://res.cloudinary.com/geliobackend/image/upload/v1720033720/profile-icon-design-free-vector.jpg.jpg';

          const UserDetails = new UserWithProfileImage(user, ProfileUrl);
          this.Users.push(UserDetails);
          continue;
        }
        const Image = await firstValueFrom(
          this.cloudinary_service.findImage(user.ProfileImageId),
        );

        const UserDetails = new UserWithProfileImage(user, Image.Url);

        this.Users.push(UserDetails);
      }
    } catch (err) {
      console.log(err);
    }
  }

  ngOnInit(): void {
    this.LoadContacts();
  }
}
