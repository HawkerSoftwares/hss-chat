import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class HssChatService {

  pollingParticipantsInstance?: number;
  _refreshParticipants$ = new Subject<void>();

  constructor() { }

  public refreshParticipants() {
    this._refreshParticipants$.next();
  }
}
