import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { Window } from '../../core/window';
import { ChatParticipantStatus } from '../../core/chat-participant-status.enum';
import { chatParticipantStatusDescriptor } from '../../core/chat-participant-status-descriptor';
import { HSSChatConfig } from '../../core/chat.config';
interface City {
  name: string,
  code: string
}

@Component({
  selector: 'ng-chat-deshboard',
  templateUrl: './ng-chat-deshboard.component.html',
  styleUrls: ['./ng-chat-deshboard.component.scss']
})
export class NgChatDeshboardComponent {
  @Input() windows: Window[] = [];
  @Input() friendsListTemplate: TemplateRef<any>;
  @Input() chatWindowTemplate: TemplateRef<any>;
  @Input() config: HSSChatConfig;
  @Input() userId: any;
  @Input() theme: string;
  @Output() onChatWindowClosed: EventEmitter<{ closedWindow: Window, closedViaEscapeKey: boolean}> = new EventEmitter();
  chatParticipantStatus = ChatParticipantStatus;
  chatParticipantStatusDescriptor = chatParticipantStatusDescriptor;
  sidebarVisible = true;

  ngOnInit() {} 
  
  onCloseWindow({index}) {
    this.onChatWindowClosed.emit({ closedWindow: this.windows[index], closedViaEscapeKey: false });
  }

  unreadMessagesTotal(window: Window): string {           
    return window.unreadMessagesTotal(this.userId);
  }

}
