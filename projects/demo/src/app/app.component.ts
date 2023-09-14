import { AfterViewInit, Component, Input } from '@angular/core';
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
  // selectedTheme:any=null;
  theme = Theme.Dark;
  themeOptions = [{title: 'Dark', value:Theme.Dark},{title: 'Light', value:Theme.Light},{title: 'Custom', value:Theme.Custom}];
  title = 'HSS Chat';
  ChatParticipantType = ChatParticipantType;
  ChatParticipantStatus = ChatParticipantStatus;
  hssChatConfig: BehaviorSubject<HSSChatConfig> = new BehaviorSubject<HSSChatConfig>(DEFAULT_CONFIG);
  isDisabled = false;
  @Input() dashboardView = true;
  sidebarVisible: boolean = false;
  adapter: ChatAdapter = new DemoAdapterPagedHistory();

  constructor(private hssChatService: HssChatService) {
    
  }

  ngAfterViewInit(): void {
    this.initRefreshParticipantsEventListener();
  }

  themeChange(){
    if(this.theme=Theme.Dark){
      this.theme=Theme.Light}  
    else if(this.theme=Theme.Light){
      this.theme=Theme.Dark
    }  
    else{
      this.theme=Theme.Custom
    }
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
