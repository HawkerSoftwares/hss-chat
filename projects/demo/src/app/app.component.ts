import { AfterViewInit, Component } from '@angular/core';
import { ChatParticipantStatus, ChatParticipantType, DEFAULT_CONFIG, Theme } from 'hss-chat';
import { ChatAdapter, HSSChatConfig, HssChatService } from 'projects/hss-chat/src/public-api';
import { BehaviorSubject, debounceTime, distinctUntilChanged, fromEvent, switchMap } from 'rxjs';
import { DemoAdapterPagedHistory } from './demo-adapter-paged-history';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  theme = Theme.Dark;
  title = 'HSS Chat';
  ChatParticipantType = ChatParticipantType;
  ChatParticipantStatus = ChatParticipantStatus;
  hssChatConfig: BehaviorSubject<HSSChatConfig> = new BehaviorSubject<HSSChatConfig>(DEFAULT_CONFIG);
  isDisabled = false;
  adapter: ChatAdapter = new DemoAdapterPagedHistory();

  constructor(private hssChatService: HssChatService) {
    
  }

  ngAfterViewInit(): void {
    this.initRefreshParticipantsEventListener();
  }
  
  updateConfig() {
    this.hssChatConfig.next({
      showAvailabilityStatus: false,
      participantChat: {
        ...DEFAULT_CONFIG.participantChat,
        preDefinedMessagesEnabled: true,
        polling: false
      },
      participants: {
        ...DEFAULT_CONFIG.participants,
        polling: false
      },
      preDefinedMessages: ['Preset Text 1', 'Preset Text 2', 'Preset Text 3']
    })
  }
  
  messageSeen(event: any) {
    console.log(event);
  }

  onDisplayNameClick(user) {
    console.log(user);
  }

  initRefreshParticipantsEventListener() {
    fromEvent(document.getElementById('refresh_participants') as HTMLInputElement, 'click')
    .pipe(
      debounceTime(1000),
      // distinctUntilChanged()
    )
    .subscribe(event => {
      console.log("Event:" + JSON.stringify(event));
      this.hssChatService.refreshParticipants();
    });
  }
}
