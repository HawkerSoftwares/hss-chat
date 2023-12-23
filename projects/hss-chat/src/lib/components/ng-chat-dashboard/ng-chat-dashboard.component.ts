import { Component, EventEmitter, Input, OnChanges, Output, SimpleChange, TemplateRef } from '@angular/core';
import { Window } from '../../core/window';
import { ChatParticipantStatus } from '../../core/chat-participant-status.enum';
import { chatParticipantStatusDescriptor } from '../../core/chat-participant-status-descriptor';
import { HSSChatConfig } from '../../core/chat.config';
import { Theme } from '../../core/theme.enum';
interface City {
  name: string,
  code: string
}

@Component({
  selector: 'ng-chat-dashboard',
  templateUrl: './ng-chat-dashboard.component.html',
  styleUrls: ['./ng-chat-dashboard.component.scss']
})
export class NgChatDashboardComponent {
  @Input() windows: Window[] = [];
  @Input() friendsListTemplate: TemplateRef<any>;
  @Input() chatWindowTemplate: TemplateRef<any>;
  @Input() config: HSSChatConfig;
  @Input() userId: any;
  @Input() theme: Theme;
  @Input() activeChatWindowIndex;
  @Input() dashboardHeaderTemplete: TemplateRef<any>;
  @Input() dashboardChatHeaderTemplete: TemplateRef<any>;
  @Input() noChatExistTemplate: TemplateRef<any>;
  @Output() onChatWindowClosed: EventEmitter<{ closedWindow: Window, closedViaEscapeKey: boolean}> = new EventEmitter();
  chatParticipantStatus = ChatParticipantStatus;
  chatParticipantStatusDescriptor = chatParticipantStatusDescriptor;
  sidebarVisible = true;
  
  onCloseWindow({index}) {
    this.onChatWindowClosed.emit({ closedWindow: this.windows[index], closedViaEscapeKey: false });
  }

  unreadMessagesTotal(window: Window): string {           
    return window.unreadMessagesTotal(this.userId);
  }

}
