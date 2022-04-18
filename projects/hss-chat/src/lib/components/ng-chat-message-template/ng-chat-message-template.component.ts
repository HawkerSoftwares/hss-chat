import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { Message } from '../../core/message';
import { MessageType } from '../../core/message-type.enum';

@Component({
  selector: 'ng-chat-message-template',
  templateUrl: './ng-chat-message-template.component.html',
  styleUrls: ['./ng-chat-message-template.component.scss']
})
export class NgChatMessageTemplateComponent implements OnInit {
  activeIndex = 0;
  viewImagesOnFullScreen = false;
  showChatMessageSetting = false;
  @Input() message: Message;
  @Input() messageTemplate: TemplateRef<any>;
  @Input() userId: any;
  @Input() showMessageDate: boolean = true;
  @Input() markMessagesAsRead: Function;
  @Input() messageDatePipeFormat: string = "shortTime";
  public MessageType = MessageType;
  constructor() { }

  ngOnInit(): void {
  }

}
