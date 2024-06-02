import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Person } from '../../models/people';
import { PersonService } from '../../services/person.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
})
export class MessagesComponent implements OnInit {
  pageName: string = 'messages';
  Users: User[] = [];
  MessageModeOn: boolean = false;

  constructor(
    private message_service: MessageService,
    private user_service: UserService,
  ) {}

  OpenMessage() {
    this.MessageModeOn = true;
  }

  async ngOnInit() {
    try {
      const user_id = await this.user_service.CurrentUserId().toPromise();
      this.message_service.LoadSentMessages(user_id).subscribe(
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
