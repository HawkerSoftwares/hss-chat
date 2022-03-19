import { ChatAdapter, IChatGroupAdapter, Group, User, Message, ChatParticipantStatus, PagedHistoryChatAdapter, ParticipantResponse, ParticipantMetadata, MessageType } from 'projects/hss-chat/src/public-api';
import { Observable, of } from 'rxjs';
import { DemoAdapter } from './demo-adapter';
import { delay } from "rxjs/operators";
import { IChatParticipant } from 'hss-chat';

export class DemoAdapterPagedHistory extends PagedHistoryChatAdapter implements IChatGroupAdapter
{
    private historyMessages: Message[] = [];
    
    constructor() {
        super();
        for(let i: number = 0; i < 20; i++) {
            let msg: any = {
                fromId: 1,
                toId: 999,
                message: `${20-i}. Hi there, just type any message bellow to test this Angular module.`,
                dateSent: new Date()
            };
            if (i % 2 === 0) {
                msg.reactions = ['😍'];
            }
            if (i % 3 === 0) {
                msg.reactions = ['😍', '😜', '😇'];
            }
            if (i % 4 === 0) {
                msg.type = MessageType.Image;
                msg.mediaUrl = 'https://images.urbndata.com/is/image/FreePeople/65516759_060_a';
            }
            if (i % 4 === 1) {
                msg.type = MessageType.File;
                msg = {
                    ...msg,
                    downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    message: 'Dummy PDF file',
                    fileSizeInBytes: 23234
                };
            }
            this.historyMessages.push(msg);
        }
    }

    getMessageHistory(destinataryId: any): Observable<Message[]> {
       let mockedHistory: Array<Message>;
       mockedHistory = [
            {
                fromId: 1,
                toId: 999,
                message: "Hi there, just type any message bellow to test this Angular module.",
                dateSent: new Date()
            }
       ];

       return of(mockedHistory).pipe(delay(500));
    }
    
    public getMessageHistoryByPage(destinataryId: any, pageSize: number, page: number) : Observable<Message[]> {
       let startPosition: number = (page - 1) * pageSize;
       let endPosition: number = page * pageSize;
       let mockedHistory: Array<Message> = this.historyMessages.slice(startPosition, endPosition);
       return of(mockedHistory.reverse()).pipe(delay(5000));
    }
    
    public listFriends(search?: string, pageSize?: number, page?: number) : Observable<ParticipantResponse[]> {
        console.log(search);
        let startPosition: number = (page-1) * pageSize;
        let endPosition: number = (page) * pageSize;
        let mockedParticipants: Array<IChatParticipant> = DemoAdapter.mockedParticipants
            .filter(user => {
                const isMatched = search && search.length ? user.displayName.toLowerCase().search(search.trim().toLowerCase())>=0 : true;
                return isMatched;
            }).slice(startPosition, endPosition);

        return of(mockedParticipants
            .map(user => {
                let participantResponse = new ParticipantResponse();
                participantResponse.participant = user;
                participantResponse.metadata = {
                    totalUnreadMessages: 4, // Demo history page size,
                    recentMessage: {
                        fromId: 1,
                        toId: 999,
                        message: "Hi there, just type any message bellow to test this Angular module.",
                        dateSent: new Date()
                    }
                }
                return participantResponse;
            }
        )).pipe(delay(5000));
    }
    
    sendMessage(message: Message): void {
        setTimeout(() => {
            let replyMessage = new Message();

            replyMessage.message = "You have typed '" + message.message + "'";
            replyMessage.dateSent = new Date();
            
            if (isNaN(message.toId))
            {
                let group = DemoAdapter.mockedParticipants.find(x => x.id == message.toId) as Group;

                // Message to a group. Pick up any participant for this
                let randomParticipantIndex = Math.floor(Math.random() * group.chattingTo.length);
                replyMessage.fromId = group.chattingTo[randomParticipantIndex].id;

                replyMessage.toId = message.toId;

                this.onMessageReceived(group, replyMessage);
            }
            else
            {
                replyMessage.fromId = message.toId;
                replyMessage.toId = message.fromId;
                
                let user = DemoAdapter.mockedParticipants.find(x => x.id == replyMessage.fromId);

                this.onMessageReceived(user, replyMessage);
            }
            
        }, 1000);
    }

    groupCreated(group: Group): void {
        DemoAdapter.mockedParticipants.push(group);

        DemoAdapter.mockedParticipants = DemoAdapter.mockedParticipants.sort((first, second) => 
            second.displayName > first.displayName ? -1 : 1
        );

        // Trigger update of friends list
        this.listFriends().subscribe(response => {
            this.onFriendsListChanged(response);
        });
    }   
}
