import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnChanges, SimpleChanges, ViewChild, ElementRef, OnInit, OnDestroy, AfterViewInit, TemplateRef } from '@angular/core';

import { IChatOption } from '../../core/chat-option';
import { ChatParticipantStatus } from "../../core/chat-participant-status.enum";
import { IChatParticipant } from "../../core/chat-participant";
import { User } from "../../core/user";
import { Window } from "../../core/window";
import { ParticipantResponse } from "../../core/participant-response";
import { MessageCounter } from "../../core/message-counter";
import { chatParticipantStatusDescriptor } from '../../core/chat-participant-status-descriptor';
import { ChatAdapter } from '../../core/chat-adapter';
import { debounceTime, distinctUntilChanged, fromEvent, interval, map, Observable, Subscription, switchMap } from 'rxjs';
import { ScrollDirection } from '../../core/scroll-direction.enum';
import { ParticipantMetadata } from '../../core/participant-metadata';
import { HssChatService } from '../../service/hss-chat.service';
import { HSSChatConfig } from '../../core/chat.config';

@Component({
    selector: 'ng-chat-friends-list',
    templateUrl: './ng-chat-friends-list.component.html',
    styleUrls: ['./ng-chat-friends-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NgChatFriendsListComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    @Input() config: HSSChatConfig;
    // UI Behavior properties
    public isLoadingMore: boolean = true;
    public hasMoreParticipants: boolean = false;
    public page: number = 1;

    @Input()
    public participantsInteractedWith: IChatParticipant[] = [];

    @Input()
    public windows: Window[];

    @Input()
    public userId: any;

    @Input()
    public shouldDisplay: boolean;

    @Input()
    public isCollapsed: boolean;

    @Input()
    public searchEnabled: boolean;

    @Input()
    public currentActiveOption: IChatOption | null;

    @Input()
    public adapter!: ChatAdapter;

    @Input() friendsListWindowHeaderTemplate: TemplateRef<any>;

    @Output()
    public onParticipantClicked: EventEmitter<IChatParticipant> = new EventEmitter();

    @Output()
    public onOptionPromptCanceled: EventEmitter<any> = new EventEmitter();

    @Output()
    public onOptionPromptConfirmed: EventEmitter<any> = new EventEmitter();

    @Output()
    public onParticipantsLoaded: EventEmitter<any> = new EventEmitter();

    @ViewChild('chatParticipants') chatParticipants: any;
    @ViewChild('searchParticipants') searchParticipants: ElementRef;

    public selectedUsersFromFriendsList: User[] = [];
    public participants: IChatParticipant[] = [];
    public participantsResponse: ParticipantResponse[] = [];
    public searchInput: string = '';
    private searchSubscription: Subscription;
    private refreshSubscription: Subscription;
    public participantsMeta: Map<number, ParticipantMetadata> = new Map();
    private isBootstrapping: boolean;
    private isResetParticipantsList: boolean;

    // Exposes enums and functions for the ng-template
    public ChatParticipantStatus = ChatParticipantStatus;
    public chatParticipantStatusDescriptor = chatParticipantStatusDescriptor;

    constructor(private hssChatService: HssChatService) {
    }

    ngOnInit() {
        this.activateFriendListFetch();
        this.refreshSubscription = this.hssChatService._refreshParticipants$.subscribe(() => {
            this.clearAndSearchParticipants().subscribe();
        });
    }

    ngAfterViewInit(): void {
        const searchBox = document.getElementById('ng-chat-search_friend') as HTMLInputElement;
        this.searchSubscription = fromEvent(searchBox, 'input')
        .pipe(
            map(e => (e.target as HTMLInputElement).value),
            debounceTime(1000),
            distinctUntilChanged(),
            switchMap((search) => {
                return this.clearAndSearchParticipants();
            })
        )
        .subscribe();
    }

    resetParticipantsList() {
        this.participants = [];
        this.participantsResponse = [];
        this.participantsMeta.clear();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.currentActiveOption) {
            const currentOptionTriggeredBy = this.currentActiveOption && this.currentActiveOption.chattingTo.participant.id;
            const isActivatedUserInSelectedList = (this.selectedUsersFromFriendsList.filter(item => item.id == currentOptionTriggeredBy)).length > 0;

            if (!isActivatedUserInSelectedList) {
                this.selectedUsersFromFriendsList = this.selectedUsersFromFriendsList.concat(this.currentActiveOption.chattingTo.participant as User);
            }
        }
    }

    ngOnDestroy(): void {
        this.searchSubscription.unsubscribe();
        this.refreshSubscription.unsubscribe();
    }

    clearAndSearchParticipants() {
        this.page = 1;
        this.resetParticipantsList();
        return this.fetchMoreParticipants();
    }

    isUserSelectedFromFriendsList(user: User): boolean {
        return (this.selectedUsersFromFriendsList.filter(item => item.id == user.id)).length > 0
    }

    unreadMessagesTotalByParticipant(participant: IChatParticipant): string {
        let openedWindow = this.windows.find(x => x.participant.id == participant.id);

        if (openedWindow) {
            return MessageCounter.unreadMessagesTotal(openedWindow, this.userId);
        }
        else {
            let totalUnreadMessages = this.participantsResponse
                .filter(x => x.participant.id == participant.id)
                .filter(x => !this.participantsInteractedWith.find(u => u.id == participant.id) && x.metadata && x.metadata.totalUnreadMessages > 0)
                .map((participantResponse) => {
                    return participantResponse.metadata.totalUnreadMessages
                })[0];

            return MessageCounter.formatUnreadMessagesTotal(totalUnreadMessages);
        }
    }

    recentMessage(participant: IChatParticipant): string {
        const metadata = this.participantsMeta.get(participant.id);
        const message = metadata?.recentMessage?.message;
        return message;
    }

    cleanUpUserSelection = () => this.selectedUsersFromFriendsList = [];

    // Toggle friends list visibility
    onChatTitleClicked(): void {
        this.isCollapsed = !this.isCollapsed;
    }

    onFriendsListCheckboxChange(selectedUser: User, isChecked: boolean): void {
        if (isChecked) {
            this.selectedUsersFromFriendsList.push(selectedUser);
        }
        else {
            this.selectedUsersFromFriendsList.splice(this.selectedUsersFromFriendsList.indexOf(selectedUser), 1);
        }
    }

    onUserClick(clickedUser: User): void {
        this.onParticipantClicked.emit(clickedUser);
    }

    onFriendsListActionCancelClicked(): void {
        this.onOptionPromptCanceled.emit();
        this.cleanUpUserSelection();
    }

    onFriendsListActionConfirmClicked(): void {
        this.onOptionPromptConfirmed.emit(this.selectedUsersFromFriendsList);
        this.cleanUpUserSelection();
    }

    onfetchMoreParticipantsClick() {
        ++this.page;
        this.isResetParticipantsList = false;
        this.fetchMoreParticipants().subscribe();
    }

    fetchMoreParticipants(): Observable<any> {
        this.isLoadingMore = true;
        return this.adapter.listFriends(this.searchInput, this.config.participants?.pageSize, this.page)
            .pipe(
                map((participantsResponse: ParticipantResponse[]) => {
                    if (this.isResetParticipantsList) {
                        this.resetParticipantsList();
                    }
                    const newParticipants = participantsResponse.map((response: ParticipantResponse) => {
                        if (response.metadata && (response.metadata.recentMessage || response.metadata.totalUnreadMessages)) {
                            this.participantsMeta.set(response.participant.id, response.metadata);
                        }
                        return response.participant;
                    });
                    this.participants = [...this.participants, ...newParticipants];
                    this.participantsResponse = [...this.participantsResponse, ...participantsResponse];
                    this.isLoadingMore = false;
                    const direction: ScrollDirection = (this.page == 1) ? ScrollDirection.Top : ScrollDirection.Bottom;
                    setTimeout(() => {
                        this.onFetchMoreParticipantsLoaded(participantsResponse, direction);
                        this.onParticipantsLoaded.emit({ participants: this.participants, participantsResponse: this.participantsResponse, isBootstrapping: this.isBootstrapping });
                        this.isBootstrapping = false;
                    }, 1);
                })
            );
    }

    private onFetchMoreParticipantsLoaded(participants: ParticipantResponse[], direction: ScrollDirection): void {
        this.isLoadingMore = false;
        this.hasMoreParticipants = participants.length == this.config.participants?.pageSize;
        this.scrollChatWindow(direction);
    }

    // Scrolls flow to the bottom or top
    private scrollChatWindow(direction: ScrollDirection): void {
        if (!this.isCollapsed) {
            setTimeout(() => {
                if (this.chatParticipants) {
                    let element = this.chatParticipants.nativeElement;
                    let position = (direction === ScrollDirection.Top) ? 0 : element.scrollHeight;
                    element.scrollTop = position;
                }
            });
        }
    }

    private activateFriendListFetch(): void {
        if (this.adapter) {
            // Loading current users list
            if (this.config.participants?.polling) {
                // Setting a long poll interval to update the friends list
                this.fetchParticipantsList(true, false);
                this.hssChatService.pollingParticipantsInstance = window.setInterval(() => this.fetchParticipantsList(false, true), this.config.participants?.interval);
            } else {
                // Since polling was disabled, a friends list update mechanism will have to be implemented in the ChatAdapter.
                this.fetchParticipantsList(true, false);
            }
        }
    }

    private fetchParticipantsList(isBootstrapping, isPolling) {
        this.isBootstrapping = isBootstrapping;
        this.isResetParticipantsList = isPolling;
        this.page = isPolling ? 1 : this.page;
        this.fetchMoreParticipants().subscribe();
    }

}
