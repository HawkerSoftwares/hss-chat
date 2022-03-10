import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnChanges, SimpleChanges, ViewChild, ElementRef, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

import { Localization } from '../../core/localization';
import { IChatOption } from '../../core/chat-option';
import { ChatParticipantStatus } from "../../core/chat-participant-status.enum";
import { IChatParticipant } from "../../core/chat-participant";
import { User } from "../../core/user";
import { Window } from "../../core/window";
import { ParticipantResponse } from "../../core/participant-response";
import { MessageCounter } from "../../core/message-counter";
import { chatParticipantStatusDescriptor } from '../../core/chat-participant-status-descriptor';
import { ChatAdapter } from '../../core/chat-adapter';
import { debounce, debounceTime, distinctUntilChanged, distinctUntilKeyChanged, filter, fromEvent, interval, map, Observable, Subject, Subscription, switchMap } from 'rxjs';
import { ScrollDirection } from '../../core/scroll-direction.enum';
import { identifierName } from '@angular/compiler';
import { ParticipantMetadata } from '../../core/participant-metadata';
import { HssChatService } from '../../service/hss-chat.service';

@Component({
    selector: 'ng-chat-friends-list',
    templateUrl: './ng-chat-friends-list.component.html',
    styleUrls: ['./ng-chat-friends-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NgChatFriendsListComponent implements OnChanges, OnDestroy, AfterViewInit {
    
    // UI Behavior properties
    public isLoadingMore: boolean = true;
    public hasMoreParticipants: boolean = false;
    public page: number = 0;

    @Input()
    public pageSize: number = 0;

    @Input()
    public participantsInteractedWith: IChatParticipant[] = [];

    @Input()
    public windows: Window[];

    @Input()
    public userId: any;

    @Input()
    public localization: Localization;

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
    private loadParticipantsSubscription: Subscription;
    public participantsMeta: Map<number, ParticipantMetadata> = new Map();
    private isBootstrapping:boolean;

    // Exposes enums and functions for the ng-template
    public ChatParticipantStatus = ChatParticipantStatus;
    public chatParticipantStatusDescriptor = chatParticipantStatusDescriptor;

    constructor(private hssChatService: HssChatService) {}

    ngAfterViewInit(): void {
        const searchBox = document.getElementById('ng-chat-search_friend') as HTMLInputElement;
        this.searchSubscription = fromEvent(searchBox, 'input').pipe(
            map(e => (e.target as HTMLInputElement).value),
            debounceTime(1000),
            distinctUntilChanged(),
            switchMap((search) => {
                this.participants = [];
                this.participantsResponse = [];
                this.participantsMeta.clear();
                this.page = 0;
                return this.fetchMoreParticipants();
            })
        ).subscribe();

        this.loadParticipantsSubscription = this.hssChatService.loadParticipants.subscribe(isBootstrapping => { 
            this.isBootstrapping = isBootstrapping;
            this.fetchMoreParticipants().subscribe();
        });
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
        this.loadParticipantsSubscription.unsubscribe();
    }

    isUserSelectedFromFriendsList(user: User) : boolean
    {
       return (this.selectedUsersFromFriendsList.filter(item => item.id == user.id)).length > 0
    }

    unreadMessagesTotalByParticipant(participant: IChatParticipant): string
    {
        let openedWindow = this.windows.find(x => x.participant.id == participant.id);

        if (openedWindow){
            return MessageCounter.unreadMessagesTotal(openedWindow, this.userId);
        }
        else
        {
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
    onChatTitleClicked(): void
    {
        this.isCollapsed = !this.isCollapsed;
    }

    onFriendsListCheckboxChange(selectedUser: User, isChecked: boolean): void
    {
        if(isChecked) {
            this.selectedUsersFromFriendsList.push(selectedUser);
        } 
        else 
        {
            this.selectedUsersFromFriendsList.splice(this.selectedUsersFromFriendsList.indexOf(selectedUser), 1);
        }
    }

    onUserClick(clickedUser: User): void
    {
        this.onParticipantClicked.emit(clickedUser);
    }

    onFriendsListActionCancelClicked(): void
    {
        this.onOptionPromptCanceled.emit();
        this.cleanUpUserSelection();
    }

    onFriendsListActionConfirmClicked() : void
    {
        this.onOptionPromptConfirmed.emit(this.selectedUsersFromFriendsList);
        this.cleanUpUserSelection();
    }

    onfetchMoreParticipantsClick() {
        this.fetchMoreParticipants().subscribe();
    }

    fetchMoreParticipants(): Observable<any> {
        this.isLoadingMore = true;
        return this.adapter.listFriends(this.searchInput, this.pageSize, ++this.page)
        .pipe(
            map((participantsResponse: ParticipantResponse[]) => {
                const newParticipants = participantsResponse.map((response: ParticipantResponse) => {
                    if(response.metadata && (response.metadata.recentMessage || response.metadata.totalUnreadMessages)){
                        this.participantsMeta.set(response.participant.id, response.metadata);
                    }
                    return response.participant;
                });
                this.participants = [...this.participants, ...newParticipants];
                this.participantsResponse = [...this.participantsResponse, ...participantsResponse];
                this.isLoadingMore = false;
                const direction: ScrollDirection = (this.page == 0) ? ScrollDirection.Top : ScrollDirection.Bottom;
                setTimeout(() => {
                    this.onFetchMoreParticipantsLoaded(participantsResponse, direction);
                    this.onParticipantsLoaded.emit({ participants: this.participants, participantsResponse: this.participantsResponse, isBootstrapping: this.isBootstrapping });
                    this.isBootstrapping = false;
                },1);
            })
        );
    }

    private onFetchMoreParticipantsLoaded(participants: ParticipantResponse[], direction: ScrollDirection): void
    {
        this.isLoadingMore = false;
        this.hasMoreParticipants = participants.length == this.pageSize;
        this.scrollChatWindow(direction);
    }

    // Scrolls flow to the bottom or top
    private scrollChatWindow(direction: ScrollDirection): void
    {
        if (!this.isCollapsed){
            setTimeout(() => {
                if (this.chatParticipants){
                    let element = this.chatParticipants.nativeElement;
                    let position = ( direction === ScrollDirection.Top ) ? 0 : element.scrollHeight;
                    element.scrollTop = position;
                }
            }); 
        }
    }
}
