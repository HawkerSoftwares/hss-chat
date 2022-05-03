import { Component, Input, OnInit, ViewChildren, QueryList, HostListener, Output, EventEmitter, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ChatAdapter } from './core/chat-adapter';
import { IChatGroupAdapter } from './core/chat-group-adapter';
import { User } from "./core/user";
import { ParticipantResponse } from "./core/participant-response";
import { IMessageSeen, Message } from "./core/message";
import { MessageType } from "./core/message-type.enum";
import { Window } from "./core/window";
import { ChatParticipantStatus } from "./core/chat-participant-status.enum";
import { ScrollDirection } from "./core/scroll-direction.enum";
import { IChatController } from './core/chat-controller';
import { PagedHistoryChatAdapter } from './core/paged-history-chat-adapter';
import { IFileUploadAdapter } from './core/file-upload-adapter';
import { DefaultFileUploadAdapter } from './core/default-file-upload-adapter';
import { Theme } from './core/theme.enum';
import { IChatOption } from './core/chat-option';
import { Group } from "./core/group";
import { ChatParticipantType } from "./core/chat-participant-type.enum";
import { IChatParticipant } from "./core/chat-participant";

import { map } from 'rxjs/operators';
import { NgChatWindowComponent } from './components/ng-chat-window/ng-chat-window.component';
import { NgChatFriendsListComponent } from './components/ng-chat-friends-list/ng-chat-friends-list.component';
import { HssChatService } from './service/hss-chat.service';
import { DEFAULT_CONFIG } from './constants/chat.config.const';
import { HSSChatConfig } from './core/chat.config';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'ng-chat',
    templateUrl: 'hss-chat.component.html',
    styleUrls: [
        'assets/icons.css',
        '../../../../node_modules/@ctrl/ngx-emoji-mart/picker.css',
        'assets/loading-spinner.css',
        'assets/ng-chat.component.default.css',
        'assets/themes/ng-chat.theme.default.scss',
        'assets/themes/ng-chat.theme.dark.scss'
    ],
    encapsulation: ViewEncapsulation.None
})

export class NgChat implements OnInit, IChatController {
    @Input() hssChatConfig: BehaviorSubject<HSSChatConfig>;
    config: HSSChatConfig = DEFAULT_CONFIG; 
    // Exposes enums for the ng-template
    public ChatParticipantType = ChatParticipantType;
    public ChatParticipantStatus = ChatParticipantStatus;
    public MessageType = MessageType;

    private _isDisabled: boolean = false;

    @Input() messageTemplate: TemplateRef<any>;
    @Input() chatWindowHeaderTemplate: TemplateRef<any>;
    @Input() friendsListWindowHeaderTemplate: TemplateRef<any>;
    @Input()
    get isDisabled(): boolean {
        return this._isDisabled;
    }
    set isDisabled(value: boolean) {
        this._isDisabled = value;

        if (value)
        {
            // To address issue https://github.com/rpaschoal/ng-chat/issues/120
            window.clearInterval(this.hssChatService.pollingParticipantsInstance)
        }
    }

    @Input()
    public adapter: ChatAdapter;

    @Input()
    public groupAdapter?: IChatGroupAdapter;

    @Input()
    public userId: any;

    @Input()
    public isCollapsed: boolean = false;

    @Input()
    public maximizeWindowOnNewMessage: boolean = true;

    @Input()
    public pollFriendsList: boolean = false;

    @Input()
    public pollingInterval: number = 5000;

    @Input()
    public historyEnabled: boolean = true;

    @Input()
    public emojisEnabled: boolean = true;

    @Input()
    public audioEnabled: boolean = true;

    @Input()
    public searchEnabled: boolean = true;

    @Input() // TODO: This might need a better content strategy
    public audioSource: string = 'https://raw.githubusercontent.com/rpaschoal/ng-chat/master/src/ng-chat/assets/notification.wav';

    @Input()
    public persistWindowsState: boolean = true;

    @Input()
    public browserNotificationsEnabled: boolean = true;

    @Input() // TODO: This might need a better content strategy
    public browserNotificationIconSource: string = 'https://raw.githubusercontent.com/rpaschoal/ng-chat/master/src/ng-chat/assets/notification.png';

    @Input()
    public hideFriendsList: boolean = false;

    @Input()
    public hideFriendsListOnUnsupportedViewport: boolean = true;

    @Input()
    public fileUploadUrl?: string;

    @Input()
    public theme: Theme = Theme.Light;

    @Input()
    public customTheme?: string;

    @Input()
    public messageDatePipeFormat: string = "shortTime";

    @Input()
    public showMessageDate: boolean = true;

    @Input()
    public isViewportOnMobileEnabled: boolean = false;

    @Input()
    public fileUploadAdapter?: IFileUploadAdapter;

    @Input()
    public showOptions: boolean = false;

    @Output()
    public onParticipantClicked: EventEmitter<IChatParticipant> = new EventEmitter<IChatParticipant>();

    @Output()
    public onParticipantChatOpened: EventEmitter<IChatParticipant> = new EventEmitter<IChatParticipant>();

    @Output()
    public onParticipantChatClosed: EventEmitter<IChatParticipant> = new EventEmitter<IChatParticipant>();

    @Output()
    public onMessagesSeen: EventEmitter<IMessageSeen> = new EventEmitter<IMessageSeen>();

    private browserNotificationsBootstrapped: boolean = false;

    public hasPagedHistory: boolean = false;

    private audioFile?: HTMLAudioElement;

    public participants!: IChatParticipant[];

    public participantsResponse?: ParticipantResponse[];

    public participantsInteractedWith: IChatParticipant[] = [];

    public currentActiveOption?: IChatOption | null;

    private get localStorageKey(): string
    {
        return `ng-chat-users-${this.userId}`; // Appending the user id so the state is unique per user in a computer.
    };

    // Defines the size of each opened window to calculate how many windows can be opened on the viewport at the same time.
    public windowSizeFactor: number = 320;

    // Total width size of the friends list section
    public friendsListWidth: number = 300;

    // Available area to render the plugin
    private viewPortTotalArea!: number;

    // Set to true if there is no space to display at least one chat window and 'hideFriendsListOnUnsupportedViewport' is true
    public unsupportedViewport: boolean = false;

    windows: Window[] = [];
    isBootstrapped: boolean = false;
    isMobileViewPort: boolean = false;

    @ViewChildren('chatWindow') chatWindows!: QueryList<NgChatWindowComponent>;
    @ViewChild(NgChatFriendsListComponent) viewChatParticipants: NgChatFriendsListComponent;

    constructor(private _httpClient: HttpClient, private hssChatService: HssChatService) {
        
    }

    ngOnInit() {
        if (this.hssChatConfig) {
            this.hssChatConfig.subscribe( cnfg => {
                if (this.config) {
                    this.config = {
                        ...DEFAULT_CONFIG,
                        ...cnfg
                    };
                }
            });
        }
        this.onResize();
        this.bootstrapChat();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?: any){
       this.viewPortTotalArea = event ? event.target.innerWidth : window.innerWidth;
       this.isMobileViewPort = this.viewPortTotalArea <= 600;
       this.NormalizeWindows();
    }

    // Checks if there are more opened windows than the view port can display
    private NormalizeWindows(): void
    {
        const maxSupportedOpenedWindows = Math.floor((this.viewPortTotalArea - (!this.hideFriendsList ? this.friendsListWidth : 0)) / this.windowSizeFactor);
        const difference = this.windows.length - maxSupportedOpenedWindows;

        if (difference >= 0)
        {
            this.windows.splice(this.windows.length - difference);
        }

        this.updateWindowsState(this.windows);

        // Viewport should have space for at least one chat window but should show in mobile if option is enabled.
        this.unsupportedViewport = this.isViewportOnMobileEnabled ? false : (this.hideFriendsListOnUnsupportedViewport && maxSupportedOpenedWindows < 1);
    }

    // Initializes the chat plugin and the messaging adapter
    private bootstrapChat(): void
    {
        let initializationException:any = null;

        if (this.adapter != null && this.userId != null)
        {
            try
            {
                this.initializeTheme();
                this.initializeBrowserNotifications();

                // Binding event listeners
                this.adapter.messageReceivedHandler = (participant, msg) => this.onMessageReceived(participant, msg);
                this.adapter.friendsListChangedHandler = (participantsResponse) => this.onFriendsListChanged(participantsResponse);

                this.bufferAudioFile();

                this.hasPagedHistory = this.adapter instanceof PagedHistoryChatAdapter;

                if (this.fileUploadUrl && this.fileUploadUrl !== "")
                {
                    this.fileUploadAdapter = new DefaultFileUploadAdapter(this.fileUploadUrl, this._httpClient);
                }

                this.NormalizeWindows();

                this.isBootstrapped = true;
            }
            catch(ex)
            {
                initializationException = ex;
            }
        }

        if (!this.isBootstrapped){
            console.error("ng-chat component couldn't be bootstrapped.");

            if (this.userId == null){
                console.error("ng-chat can't be initialized without an user id. Please make sure you've provided an userId as a parameter of the ng-chat component.");
            }
            if (this.adapter == null){
                console.error("ng-chat can't be bootstrapped without a ChatAdapter. Please make sure you've provided a ChatAdapter implementation as a parameter of the ng-chat component.");
            }
            if (initializationException)
            {
                console.error(`An exception has occurred while initializing ng-chat. Details: ${initializationException.message}`);
                console.error(initializationException);
            }
        }
    }

    // Initializes browser notifications
    private async initializeBrowserNotifications()
    {
        if (this.browserNotificationsEnabled && ("Notification" in window))
        {
            if (await Notification.requestPermission() === "granted")
            {
                this.browserNotificationsBootstrapped = true;
            }
        }
    }


    private initializeTheme(): void
    {
        if (this.customTheme)
        {
            this.theme = Theme.Custom;
        }
        else if (this.theme != Theme.Light && this.theme != Theme.Dark)
        {
            // TODO: Use es2017 in future with Object.values(Theme).includes(this.theme) to do this check
            throw new Error(`Invalid theme configuration for ng-chat. "${this.theme}" is not a valid theme value.`);
        }
    }

    participantsLoaded({ participants, participantsResponse, isBootstrapping }) {
        this.participants = participants;
        this.participantsResponse = participantsResponse;
        if (isBootstrapping)
        {
            this.restoreWindowsState();
        }
    }

    fetchMessageHistory({window, polling}: any) {
        // Not ideal but will keep this until we decide if we are shipping pagination with the default adapter
        if(polling) {
            const messages = window.messages;
            this.adapter.getRecentMessages(window.participant.id, messages[(messages.length > 1) ? (messages.length - 1) : (messages.length ? messages[0] : null)])
            .pipe(
                map((messages: Message[]) => {
                    if(messages.length > 0) {
                        messages.map(message => {
                            this.onMessageReceived(window.participant, message);
                        });
                        // window.messages = [
                        //     ...window.messages,
                        //     ...result
                        // ];
                        this.addDateGroupflag(window.messages);
                    }
                })
            ).subscribe();
        } else if (this.adapter instanceof PagedHistoryChatAdapter)
        {   
            window.isLoadingHistory = true;
            this.adapter.getMessageHistoryByPage(window.participant.id, this.config.participantChat.pageSize , ++window.historyPage)
            .pipe(
                map((result: Message[]) => {
                    window.messages = result.concat(window.messages);
                    window.isLoadingHistory = false;
                    const direction: ScrollDirection = (window.historyPage == 1) ? ScrollDirection.Bottom : ScrollDirection.Top;
                    window.hasMoreMessages = result.length == this.config.participantChat.pageSize;
                    setTimeout(() => this.onFetchMessageHistoryLoaded(result, window, direction, true));
                })
            ).subscribe();
        } else {
            this.adapter.getMessageHistory(window.participant.id)
            .pipe(
                map((result: Message[]) => {
                    window.messages = result.concat(window.messages);
                    window.isLoadingHistory = false;
                    setTimeout(() => this.onFetchMessageHistoryLoaded(result, window, ScrollDirection.Bottom));
                })
            ).subscribe();
        }
    }

    private onFetchMessageHistoryLoaded(messages: Message[], window: Window, direction: ScrollDirection, forceMarkMessagesAsSeen: boolean = false): void
    {
        this.addDateGroupflag(window.messages);
        this.scrollChatWindow(window, direction)

        if (window.hasFocus || forceMarkMessagesAsSeen)
        {
            this.markMessagesAsRead(messages, window);
        }
    }
    
    addDateGroupflag(messages: Message[]) {
        for (let index = 0; index < messages.length;) {
            messages[index].formattedDate = null;
            messages[index].newDateStarted = false;
            const today = new Date(new Date().setHours(0, 0, 0, 0));
            const currentMsgDate = new Date(new Date(messages[index].dateSent).setHours(0, 0, 0, 0));
            if (currentMsgDate.toString() === today.toString()) {
                messages[index].formattedDate = 'Today';
            }
            if (index === 0) {
                messages[index].newDateStarted = true;
            } else {
                const lastMsgDate = new Date(new Date(messages[index - 1].dateSent).setHours(0, 0, 0, 0));
                messages[index].newDateStarted = currentMsgDate > lastMsgDate ? true : false;
            }
            index = index + 1;
        }
    }

    // Updates the friends list via the event handler
    private onFriendsListChanged(participantsResponse: ParticipantResponse[]): void
    {
        if (participantsResponse)
        {
            this.participantsResponse = participantsResponse;

            this.participants = participantsResponse.map((response: ParticipantResponse) => {
                return response.participant;
            });

            this.participantsInteractedWith = [];
        }
    }

    // Handles received messages by the adapter
    private onMessageReceived(participant: IChatParticipant, message: Message)
    {
        if (participant && message)
        {
            const chatWindow = this.openChatWindow(participant);

            if (!chatWindow[1] || !this.historyEnabled){
                chatWindow[0].messages.push(message);
                const chatWindowInst = this.getChatWindowComponentInstance(chatWindow[0]);
                const hasScrolledChatWindow = chatWindowInst.hasScrolledChatWindow();
                if (!hasScrolledChatWindow) {
                    this.markMessagesAsRead(chatWindow[0].messages, chatWindow[0]);
                    this.scrollChatWindow(chatWindow[0], ScrollDirection.Bottom);
                }
            }

            this.emitMessageSound(chatWindow[0]);

            // Github issue #58
            // Do not push browser notifications with message content for privacy purposes if the 'maximizeWindowOnNewMessage' setting is off and this is a new chat window.
            if (this.maximizeWindowOnNewMessage || (!chatWindow[1] && !chatWindow[0].isCollapsed))
            {
                // Some messages are not pushed because they are loaded by fetching the history hence why we supply the message here
                this.emitBrowserNotification(chatWindow[0], message);
            }
        }
    }

    onParticipantClickedFromFriendsList(participant: IChatParticipant): void {
        this.openChatWindow(participant, true, true);
    }

    private cancelOptionPrompt(): void {
        if (this.currentActiveOption)
        {
            this.currentActiveOption.isActive = false;
            this.currentActiveOption = null;
        }
    }

    onOptionPromptConfirmed(event: any): void {
        // For now this is fine as there is only one option available. Introduce option types and type checking if a new option is added.
        this.confirmNewGroup(event);

        // Canceling current state
        this.cancelOptionPrompt();
    }

    private confirmNewGroup(users: User[]): void {
        const newGroup = new Group(users);

        this.openChatWindow(newGroup);

        if (this.groupAdapter)
        {
            this.groupAdapter.groupCreated(newGroup);
        }
    }

    // Opens a new chat whindow. Takes care of available viewport
    // Works for opening a chat window for an user or for a group
    // Returns => [Window: Window object reference, boolean: Indicates if this window is a new chat window]
    private openChatWindow(participant: IChatParticipant, focusOnNewWindow: boolean = false, invokedByUserClick: boolean = false): [Window, boolean]
    {
        // Is this window opened?
        const openedWindow = this.windows.find(x => x.participant.id == participant.id);

        // Hide friendlist on mobile when specific chat window is opened
        this.hideFriendsList = this.isMobileViewPort;
        
        if (!openedWindow)
        {
            if (invokedByUserClick)
            {
                this.onParticipantClicked.emit(participant);
            }

            // Refer to issue #58 on Github
            const collapseWindow = invokedByUserClick ? false : !this.maximizeWindowOnNewMessage;

            const newChatWindow: Window = new Window(participant, this.historyEnabled, collapseWindow);

            // Loads the chat history via an RxJs Observable
            if (this.historyEnabled)
            {
                this.fetchMessageHistory({window: newChatWindow, polling: false});
            }

            this.windows.unshift(newChatWindow);

            // Is there enough space left in the view port ? but should be displayed in mobile if option is enabled
            if (!this.isViewportOnMobileEnabled) {
                if (this.windows.length * this.windowSizeFactor >= this.viewPortTotalArea - (!this.hideFriendsList ? this.friendsListWidth : 0)) {
                    this.windows.pop();
                }
            }

            this.updateWindowsState(this.windows);

            if (focusOnNewWindow && !collapseWindow)
            {
                this.focusOnWindow(newChatWindow);
            }

            this.participantsInteractedWith.push(participant);
            this.onParticipantChatOpened.emit(participant);

            return [newChatWindow, true];
        }
        else
        {
            // Returns the existing chat window
            return [openedWindow, false];
        }
    }

    // Focus on the input element of the supplied window
    private focusOnWindow(window: Window, callback: Function = () => {}) : void
    {
        const windowIndex = this.windows.indexOf(window);
        if (windowIndex >= 0)
        {
            setTimeout(() => {
                if (this.chatWindows)
                {
                    const chatWindowToFocus = this.chatWindows.toArray()[windowIndex];

                    chatWindowToFocus.chatWindowInput.nativeElement.focus();
                }

                callback();
            });
        }
    }

    // Marks all messages provided as read with the current time.
    markMessagesAsRead(messages: Message[], window?: Window): void
    {
        this.onMessagesSeen.emit({destinataryId: window.participant.id,messages, success: () => {
            const currentDate = new Date();
            const unseenMessages = [];
            messages.forEach((msg)=>{
                if (!msg.dateSeen) {
                    unseenMessages.push(msg);
                    msg.dateSeen = currentDate;
                }
            });
            window.messages = messages;
        }});
    }

    // Buffers audio file (For component's bootstrapping)
    private bufferAudioFile(): void {
        if (this.audioSource && this.audioSource.length > 0)
        {
            this.audioFile = new Audio();
            this.audioFile.src = this.audioSource;
            this.audioFile.load();
        }
    }

    // Emits a message notification audio if enabled after every message received
    private emitMessageSound(window: Window): void
    {
        if (this.audioEnabled && !window.hasFocus && this.audioFile) {
            this.audioFile.play();
        }
    }

    // Emits a browser notification
    private emitBrowserNotification(window: Window, message: Message): void
    {
        if (this.browserNotificationsBootstrapped && !window.hasFocus && message) {
            const notification = new Notification(`${this.config.notification.title} ${window.participant.displayName}`, {
                'body': message.message,
                'icon': this.browserNotificationIconSource
            });

            setTimeout(() => {
                notification.close();
            }, message.message.length <= 50 ? 5000 : 7000); // More time to read longer messages
        }
    }

    // Saves current windows state into local storage if persistence is enabled
    private updateWindowsState(windows: Window[]): void
    {
        if (this.persistWindowsState && this.participants && this.participants.length)
        {
            const participantIds = windows.map((w) => {
                return w.participant.id;
            });

            localStorage.setItem(this.localStorageKey, JSON.stringify(participantIds));
        }
    }

    private restoreWindowsState(): void
    {
        try
        {
            if (this.persistWindowsState)
            {
                const stringfiedParticipantIds = localStorage.getItem(this.localStorageKey);

                if (stringfiedParticipantIds && stringfiedParticipantIds.length > 0)
                {
                    const participantIds = <number[]>JSON.parse(stringfiedParticipantIds);

                    const participantsToRestore = this.participants.filter(u => participantIds.indexOf(u.id) >= 0);

                    participantsToRestore.forEach((participant) => {
                        this.openChatWindow(participant);
                    });
                }
            }
        }
        catch (ex)
        {
            console.error(`An error occurred while restoring ng-chat windows state. Details: ${ex}`);
        }
    }

    // Gets closest open window if any. Most recent opened has priority (Right)
    private getClosestWindow(window: Window): Window | undefined
    {
        const index = this.windows.indexOf(window);

        if (index > 0)
        {
            return this.windows[index - 1];
        }
        else if (index == 0 && this.windows.length > 1)
        {
            return this.windows[index + 1];
        }
        return this.windows[index];
    }

    private closeWindow(window: Window): void
    {
        // Show friendlist when chat window is closed if viewport is supported
        this.hideFriendsList = this.unsupportedViewport;

        const index = this.windows.indexOf(window);

        this.windows.splice(index, 1);

        this.updateWindowsState(this.windows);
        this.participantsInteractedWith = this.participantsInteractedWith.filter( participant => participant.id !== window.participant.id);
        this.onParticipantChatClosed.emit(window.participant);
    }

    private getChatWindowComponentInstance(targetWindow: Window): NgChatWindowComponent | null {
        const windowIndex = this.windows.indexOf(targetWindow);

        if (this.chatWindows){
            let targetWindow = this.chatWindows.toArray()[windowIndex];

            return targetWindow;
        }

        return null;
    }

    // Scrolls a chat window message flow to the bottom
    private scrollChatWindow(window: Window, direction: ScrollDirection): void
    {
        const chatWindow = this.getChatWindowComponentInstance(window);

        if (chatWindow){
            chatWindow.scrollChatWindow(window, direction);
        }
    }

    onWindowMessagesSeen({messages, window}: {messages: Message[], window: Window}): void {
        this.markMessagesAsRead(messages, window);
    }

    onWindowChatClosed(payload: { closedWindow: Window, closedViaEscapeKey: boolean }): void {
        const { closedWindow, closedViaEscapeKey } = payload;

        if (closedViaEscapeKey) {
            let closestWindow = this.getClosestWindow(closedWindow);

            if (closestWindow)
            {
                this.focusOnWindow(closestWindow, () => { this.closeWindow(closedWindow); });
            }
            else
            {
                this.closeWindow(closedWindow);
            }
        }
        else {
            this.closeWindow(closedWindow);
        }
    }

    onWindowTabTriggered(payload: { triggeringWindow: Window, shiftKeyPressed: boolean }): void {
        const { triggeringWindow, shiftKeyPressed } = payload;

        const currentWindowIndex = this.windows.indexOf(triggeringWindow);
        let windowToFocus = this.windows[currentWindowIndex + (shiftKeyPressed ? 1 : -1)]; // Goes back on shift + tab

        if (!windowToFocus)
        {
            // Edge windows, go to start or end
            windowToFocus = this.windows[currentWindowIndex > 0 ? 0 : this.chatWindows.length - 1];
        }

        this.focusOnWindow(windowToFocus);
    }

    onWindowMessageSent(messageSent: Message): void {
        this.adapter.sendMessage(messageSent);
    }

    onWindowOptionTriggered(option: IChatOption): void {
        this.currentActiveOption = option;
    }

    triggerOpenChatWindow(user: User): void {
        if (user)
        {
            this.openChatWindow(user);
        }
    }

    triggerCloseChatWindow(userId: any): void {
        const openedWindow = this.windows.find(x => x.participant.id == userId);

        if (openedWindow)
        {
            this.closeWindow(openedWindow);
        }
    }

    triggerToggleChatWindowVisibility(userId: any): void {
        const openedWindow = this.windows.find(x => x.participant.id == userId);

        if (openedWindow)
        {
            const chatWindow = this.getChatWindowComponentInstance(openedWindow);

            if (chatWindow){
                chatWindow.onChatWindowClicked(openedWindow);
            }
        }
    }
}
