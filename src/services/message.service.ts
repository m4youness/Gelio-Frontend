import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { ApiUrl } from '../enviroment/ApiUrl';
import { Message } from '../models/Message';
import { MessageInfo } from '../models/MessageInfo';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private ApiUrl = ApiUrl;
  constructor(private http: HttpClient) {}

  LoadContacts(PersonId?: number | null): Observable<User[]> {
    return this.http.get<User[]>(this.ApiUrl + `LoadContacts/${PersonId}`);
  }

  LoadMessages(
    SenderID?: number | null,
    ReceiverID?: number | null,
  ): Observable<Message[]> {
    return this.http.post<Message[]>(this.ApiUrl + 'LoadMessages', {
      SenderId: SenderID,
      ReceiverId: ReceiverID,
    });
  }

  GetMessageInfo(MessageInfoId?: number | null): Observable<MessageInfo> {
    return this.http.get<MessageInfo>(
      this.ApiUrl + `MessageInfo/${MessageInfoId}`,
    );
  }

  SendMessage(
    senderId?: number | null,
    receiverId?: number | null,
    message?: string | null,
    sentDate?: string | null,
  ): Observable<number> {
    return this.http.post<number>(this.ApiUrl + 'Message', {
      SenderId: senderId,
      ReceiverId: receiverId,
      Message: message,
      SentDate: sentDate,
    });
  }
}
