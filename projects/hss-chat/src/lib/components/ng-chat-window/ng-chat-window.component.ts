import { Component, Input, Output, EventEmitter, ViewEncapsulation, ViewChild, ElementRef, TemplateRef, OnInit, OnChanges, DoCheck, SimpleChanges } from '@angular/core';

import { Message } from "../../core/message";
import { Window } from "../../core/window";
import { ChatParticipantStatus } from "../../core/chat-participant-status.enum";
import { ScrollDirection } from "../../core/scroll-direction.enum";
import { IFileUploadAdapter } from '../../core/file-upload-adapter';
import { IChatOption } from '../../core/chat-option';
import { Group } from "../../core/group";
import { ChatParticipantType } from "../../core/chat-participant-type.enum";
import { IChatParticipant } from "../../core/chat-participant";
import { MessageCounter } from "../../core/message-counter";
import { chatParticipantStatusDescriptor } from '../../core/chat-participant-status-descriptor';
import { ChatAdapter } from '../../core/chat-adapter';
import { HSSChatConfig } from '../../core/chat.config';
import { interval, takeWhile, timer } from 'rxjs';
import { Theme } from '../../core/theme.enum';

@Component({
    selector: 'ng-chat-window',
    templateUrl: './ng-chat-window.component.html',
    styleUrls: ['./ng-chat-window.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NgChatWindowComponent implements OnInit, OnChanges {
    emojiPopupDisplay: boolean;
    preDefineMessagesPopup: boolean;
    @Input() config: HSSChatConfig;
    @Input() messageTemplate: TemplateRef<any>;
    @Input() chatWindowHeaderTemplate: TemplateRef<any>;
    @Input()
    public fileUploadAdapter: IFileUploadAdapter;
    @Input() theme: Theme;
    @Input()
    public window: Window;

    @Input()
    public userId: any;

    @Input()
    public showOptions: boolean;

    @Input()    
    public emojisEnabled: boolean = true;

    @Input()
    public showMessageDate: boolean = true;

    @Input()
    public messageDatePipeFormat: string = "shortTime";

    @Input()
    public hasPagedHistory: boolean = true;

    @Input()
    public adapter!: ChatAdapter;

    @Output()
    public onChatWindowClosed: EventEmitter<{ closedWindow: Window, closedViaEscapeKey: boolean}> = new EventEmitter();

    @Output()
    public onMessagesSeen: EventEmitter<{messages: Message[], window: Window}> = new EventEmitter();

    @Output()
    public onMessageSent: EventEmitter<Message> = new EventEmitter();

    @Output()
    public onTabTriggered: EventEmitter<{ triggeringWindow: Window, shiftKeyPressed: boolean }> = new EventEmitter();

    @Output()
    public onOptionTriggered: EventEmitter<IChatOption> = new EventEmitter();

    @Output()
    public onLoadHistoryTriggered: EventEmitter<{window: Window, polling: boolean}> = new EventEmitter();

    @ViewChild('chatMessages') chatMessages: any;
    @ViewChild('nativeFileInput') nativeFileInput: ElementRef;
    @ViewChild('chatWindowInput') chatWindowInput: any;
    sheetSize: 16 | 20 | 32 | 64 | 72 = 32;

    // File upload state
    public fileUploadersInUse: string[] = []; // Id bucket of uploaders in use
    
    // Exposes enums and functions for the ng-template
    public ChatParticipantType = ChatParticipantType;
    public ChatParticipantStatus = ChatParticipantStatus;
    public chatParticipantStatusDescriptor = chatParticipantStatusDescriptor;

    constructor() {
    }

    ngOnInit(): void {
        this.fetchRecentMessages();
    }

    ngOnChanges(changes: any): void {}

    defaultWindowOptions(currentWindow: Window): IChatOption[]
    {
        if (this.showOptions && currentWindow.participant.participantType == ChatParticipantType.User)
        {
            return [{
                isActive: false,
                chattingTo: currentWindow,
                validateContext: (participant: IChatParticipant) => {
                    return participant.participantType == ChatParticipantType.User;
                },
                displayLabel: 'Add People' // TODO: Localize this
            }];
        }

        return [];
    }

    // Asserts if a user avatar is visible in a chat cluster
    isAvatarVisible(window: Window, message: Message, index: number): boolean
    {
        if (message.fromId != this.userId){
            if (index == 0){
                return true; // First message, good to show the thumbnail
            }
            else{
                // Check if the previous message belongs to the same user, if it belongs there is no need to show the avatar again to form the message cluster
                if (window.messages[index - 1].fromId != message.fromId){
                    return true;
                }
            }
        }

        return false;
    }

    isUploadingFile(window: Window): boolean
    {
        const fileUploadInstanceId = this.getUniqueFileUploadInstanceId(window);

        return this.fileUploadersInUse.indexOf(fileUploadInstanceId) > -1;
    }

    // Generates a unique file uploader id for each participant
    getUniqueFileUploadInstanceId(window: Window): string
    {
        if (window && window.participant)
        {
            return `ng-chat-file-upload-${window.participant.id}`;
        }
        
        return 'ng-chat-file-upload';
    }

    unreadMessagesTotal(): string {           
        return this.window.unreadMessagesTotal(this.userId);
    }

    // Scrolls a chat window message flow to the bottom
    scrollChatWindow(window: Window, direction: ScrollDirection): void
    {
        if (!window.isCollapsed){
            setTimeout(() => {
                if (this.chatMessages){
                    let element = this.chatMessages.nativeElement;
                    let position = ( direction === ScrollDirection.Top ) ? 0 : element.scrollHeight + 1000;
                    element.scrollTop = position;
                }
            }); 
        }
    }

    hasScrolledChatWindow(): boolean {
        if (!this.window.isCollapsed) {
            let element: HTMLDivElement = this.chatMessages.nativeElement;
            return ((element.scrollHeight - element.scrollTop) > 350);
        } else {
            return true;
        }
    }

    activeOptionTrackerChange(option: IChatOption): void {
        this.onOptionTriggered.emit(option);
    }

    // Triggers native file upload for file selection from the user
    triggerNativeFileUpload(window: Window): void
    {
        if (window)
        {
            if (this.nativeFileInput) this.nativeFileInput.nativeElement.click();
        }
    }

    // Toggles a window focus on the focus/blur of a 'newMessage' input
    toggleWindowFocus(window: Window): void
    {
        window.hasFocus = !window.hasFocus;
        if(window.hasFocus) {
            const unreadMessages = window.messages
                .filter(message => message.dateSeen == null 
                    && (message.toId == this.userId || window.participant.participantType === ChatParticipantType.Group));
            
            if (unreadMessages && unreadMessages.length > 0)
            {
                this.onMessagesSeen.emit({messages: unreadMessages, window: this.window});
            }
        }
    }

    markMessagesAsRead(messages: Message[]): void 
    {
        this.onMessagesSeen.emit({messages, window: this.window});
    }

    fetchMessageHistory(window: Window): void {
        this.onLoadHistoryTriggered.emit({window: window, polling: false});
    }

    // Closes a chat window via the close 'X' button
    onCloseChatWindow(): void 
    {
        this.onChatWindowClosed.emit({ closedWindow: this.window, closedViaEscapeKey: false });
    }

    /*  Monitors pressed keys on a chat window
        - Dispatches a message when the ENTER key is pressed
        - Tabs between windows on TAB or SHIFT + TAB
        - Closes the current focused window on ESC
    */
   onChatInputTyped(event: any, window: Window): void
   {
       switch (event.keyCode)
       {
        //    case 13:
        //        this.sendMessage(window);
        //        break;
           case 9:
               event.preventDefault();

               this.onTabTriggered.emit({ triggeringWindow: window, shiftKeyPressed: event.shiftKey });

               break;
           case 27:
               this.onChatWindowClosed.emit({ closedWindow: window, closedViaEscapeKey: true });

               break;
       }
   }

   sendMessage(window) {
    if (window.newMessage && window.newMessage.trim() != "") {
        let message = new Message();
 
        message.fromId = this.userId;
        message.toId = window.participant.id;
        message.message = window.newMessage.replace(/\n/g, "<br>");
        message.dateSent = new Date();

        window.messages.push(message);

        this.onMessageSent.emit(message);

        window.newMessage = ""; // Resets the new message input

        this.scrollChatWindow(window, ScrollDirection.Bottom);
    }
   }

    // Toggles a chat window visibility between maximized/minimized
    onChatWindowClicked(window: Window): void
    {
        window.isCollapsed = !window.isCollapsed;
        this.scrollChatWindow(window, ScrollDirection.Bottom);
    }

    private clearInUseFileUploader(fileUploadInstanceId: string): void
    {
        const uploaderInstanceIdIndex = this.fileUploadersInUse.indexOf(fileUploadInstanceId);

        if (uploaderInstanceIdIndex > -1) {
            this.fileUploadersInUse.splice(uploaderInstanceIdIndex, 1);
        }
    }

    // Handles file selection and uploads the selected file using the file upload adapter
    onFileChosen(window: Window): void {
        const fileUploadInstanceId = this.getUniqueFileUploadInstanceId(window);
        const uploadElementRef = this.nativeFileInput;

        if (uploadElementRef)
        {
            const file: File = uploadElementRef.nativeElement.files[0];

            this.fileUploadersInUse.push(fileUploadInstanceId);

            this.fileUploadAdapter.uploadFile(file, window.participant.id)
                .subscribe(fileMessage => {
                    this.clearInUseFileUploader(fileUploadInstanceId);

                    fileMessage.fromId = this.userId;

                    // Push file message to current user window   
                    window.messages.push(fileMessage);
        
                    this.onMessageSent.emit(fileMessage);
        
                    this.scrollChatWindow(window, ScrollDirection.Bottom);

                    // Resets the file upload element
                    uploadElementRef.nativeElement.value = '';
                }, (error) => {
                    this.clearInUseFileUploader(fileUploadInstanceId);

                    // Resets the file upload element
                    uploadElementRef.nativeElement.value = '';

                    // TODO: Invoke a file upload adapter error here
                });
        }
    }

    
    fetchRecentMessages(): void {
        interval(this.config.participantChat.interval)
            .pipe(takeWhile(i => this.config.participantChat.polling))
            .subscribe(n =>  this.onLoadHistoryTriggered.emit({window: this.window, polling: true}));
    }

    addEmoji({ emoji }, window: Window) {
        window.newMessage = `${window.newMessage ? window.newMessage : ''}${emoji.native}`;
    }

    scrollDownToUnseenMessages() {
        document.getElementById('unreadMessages').scrollIntoView();
    }

    togglePreDefineMsgsPopup(event) {
        if (event && event.value) {
            this.window.newMessage = event.value;
            this.onChatInputTyped({keyCode: 13}, this.window);
            this._togglePredefinedMessages();
        } else {
            this._togglePredefinedMessages();
            if(this.preDefineMessagesPopup) {
                if (this.config.preDefinedMessages && this.config.preDefinedMessages.length) {
                    this.window.preDefinedMessages = this.config.preDefinedMessages;
                } else if (!this.window.preDefinedMessages || !this.window.preDefinedMessages?.length) {
                    this.adapter.getPresetMessages(this.window.participant.id).subscribe(texts => {
                        this.window.preDefinedMessages = texts ? texts : [];
                    });
                }
            }
        }
    }

    _togglePredefinedMessages(){
        this.preDefineMessagesPopup = !this.preDefineMessagesPopup;
        this.emojiPopupDisplay = false;
    }
}
