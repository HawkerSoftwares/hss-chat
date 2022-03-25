import { Component, Input, OnInit } from '@angular/core';

export enum ChatMessageActionType {
   EMOJI = 'EMOJI'
}

export interface ChatMessageAction {
  title?: string;
  icon?: string;
  image?: string;
  hoverText?: string;
  subActions?: ChatMessageAction[];
  click?: Function;
  type?: ChatMessageActionType
}

@Component({
  selector: 'ng-chat-message-setting',
  templateUrl: './ng-chat-message-setting.component.html',
  styleUrls: ['./ng-chat-message-setting.component.scss']
})
export class NgChatMessageSettingComponent implements OnInit {
  id = Date.now();
  chatMessageActionType = ChatMessageActionType;
  @Input() actions: ChatMessageAction[] = [
    {
      type: ChatMessageActionType.EMOJI,
      click: this.addEmoji.bind(this)
    }
  ];
  constructor() { }

  ngOnInit(): void {
  }

  addEmoji(event, action) {
    console.log(event, action);
  }

}
