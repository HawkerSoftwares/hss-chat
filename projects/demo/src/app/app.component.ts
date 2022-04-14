import { Component } from '@angular/core';
import { ChatParticipantStatus, ChatParticipantType, DEFAULT_CONFIG } from 'hss-chat';
import { ChatAdapter, HSSChatConfig } from 'projects/hss-chat/src/public-api';
import { BehaviorSubject } from 'rxjs';
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
  hssChatConfig: BehaviorSubject<HSSChatConfig> = new BehaviorSubject<HSSChatConfig>(DEFAULT_CONFIG);
  isDisabled = false;
  adapter: ChatAdapter = new DemoAdapterPagedHistory();
  constructor() {
  }

  
  updateConfig() {
    this.hssChatConfig.next({
      showAvailabilityStatus: false,
      preDefinedMessages: ['Hi there, just type any message bellow to test this Angular module.', 'Option 2', 'Option 3', 'Option 4', 'Option 5']
    })
  }
  
  
  messageSeen(event: any) {
    console.log(event);
  }

  onDisplayNameClick(user) {
    console.log(user);
  }

}
