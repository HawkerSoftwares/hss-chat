import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HssChatService {
  events = new Subject();
  loadParticipants = new ReplaySubject<boolean>(1); //Subjects which emits last value only

  constructor() { }

}
