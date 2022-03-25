import { Component } from '@angular/core';
import { ChatParticipantStatus, ChatParticipantType } from 'hss-chat';
import { ChatAdapter } from 'projects/hss-chat/src/public-api';
import { DemoAdapterPagedHistory } from './demo-adapter-paged-history';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'HSS Chat';
  ChatParticipantType = ChatParticipantType;
  ChatParticipantStatus = ChatParticipantStatus;
  // chatParticipantStatusDescriptor = chatParticipantStatusDescriptor;

  public adapter: ChatAdapter = new DemoAdapterPagedHistory();

  public messageSeen(event: any) {
    console.log(event);
  }

  onDisplayNameClick(self) {
    console.log(self.userId);
  }

}
