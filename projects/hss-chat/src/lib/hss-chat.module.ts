import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NgChat } from './hss-chat.component';
import { EmojifyPipe } from './pipes/emojify.pipe';
import { SanitizePipe } from './pipes/sanitize.pipe';
import { GroupMessageDisplayNamePipe } from './pipes/group-message-display-name.pipe';
import { NgChatOptionsComponent } from './components/ng-chat-options/ng-chat-options.component';
import { NgChatFriendsListComponent } from './components/ng-chat-friends-list/ng-chat-friends-list.component';
import { NgChatWindowComponent } from './components/ng-chat-window/ng-chat-window.component';
import { NGPrimeModule } from './modules/ngp.module';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { NgChatMessageTemplateComponent } from './components/ng-chat-message-template/ng-chat-message-template.component';
import { LinkyModule } from 'ngx-linky';
import { NgChatDashboardComponent } from './components/ng-chat-dashboard/ng-chat-dashboard.component';

@NgModule({
  imports: [CommonModule, FormsModule, HttpClientModule, NGPrimeModule, PickerModule, LinkyModule ],
  declarations: [
    NgChat, 
    EmojifyPipe, 
    SanitizePipe, 
    GroupMessageDisplayNamePipe, 
    NgChatOptionsComponent, 
    NgChatFriendsListComponent, 
    NgChatWindowComponent, NgChatMessageTemplateComponent, NgChatDashboardComponent
  ],
  exports: [NgChat]
})
export class NgChatModule {
}
