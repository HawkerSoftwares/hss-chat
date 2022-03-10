import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HssChatService {

  loadParticipants = new ReplaySubject<boolean>(1); //Subjects which emits last value only

  constructor() { }

}
