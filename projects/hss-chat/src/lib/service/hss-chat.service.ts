import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

export interface LoadMessagesEvent {
  isPolling?: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class HssChatService {
  pollingParticipantsInstance?: number;
  loadMessages = new ReplaySubject<LoadMessagesEvent>(1); //Subjects which emits last value only
  events = new Subject();

  constructor() { }

}
