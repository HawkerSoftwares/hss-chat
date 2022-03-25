import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

export interface LoadParticipantsEvent {
  isBootstrapping?: boolean;
  isPolling?: boolean;
}

export interface LoadMessagesEvent {
  isPolling?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HssChatService {

  loadParticipants = new ReplaySubject<LoadParticipantsEvent>(1); //Subjects which emits last value only
  loadMessages = new ReplaySubject<LoadMessagesEvent>(1); //Subjects which emits last value only
  events = new Subject();

  constructor() { }

}
