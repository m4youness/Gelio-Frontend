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
    return this.http.get<User[]>(this.ApiUrl + `Contacts/${PersonId}`, {
      withCredentials: true,
    });
  }

  LoadMessages(SenderID: number, ReceiverID: number): Observable<Message[]> {
    return this.http.post<Message[]>(
      this.ApiUrl + 'Load/Messages',
      {
        SenderId: SenderID,
        ReceiverId: ReceiverID,
      },
      { withCredentials: true },
    );
  }

  SendMessage(
    senderId: number,
    receiverId: number,
    message: string,
    sentDate: string,
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

  AddContact(username: string, userId: number): Observable<boolean> {
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
