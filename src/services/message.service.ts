import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { ApiUrl } from '../enviroment/ApiUrl';
import { Message } from '../models/Message';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private ApiUrl = ApiUrl;
  constructor(private http: HttpClient) {}

  LoadContacts(PersonId?: number | null): Observable<User[]> {
    return this.http.get<User[]>(this.ApiUrl + `LoadContacts/${PersonId}`, {
      withCredentials: true,
    });
  }

  LoadMessages(
    SenderID?: number | null,
    ReceiverID?: number | null,
  ): Observable<Message[]> {
    return this.http.post<Message[]>(
      this.ApiUrl + 'LoadMessages',
      {
        SenderId: SenderID,
        ReceiverId: ReceiverID,
      },
      { withCredentials: true },
    );
  }

  SendMessage(
    senderId?: number | null,
    receiverId?: number | null,
    message?: string | null,
    sentDate?: string | null,
  ): Observable<number> {
    return this.http.post<number>(
      this.ApiUrl + 'Message',
      {
        SenderId: senderId,
        ReceiverId: receiverId,
        Message: message,
        SentDate: sentDate,
      },
      { withCredentials: true },
    );
  }

  AddContact(
    username?: string | null,
    userId?: number | null,
  ): Observable<boolean> {
    return this.http.post<boolean>(
      this.ApiUrl + 'Contact',
      {
        Username: username,
        UserId: userId,
      },
      { withCredentials: true },
    );
  }
}
