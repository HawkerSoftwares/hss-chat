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
            let msg: Message = {
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
                msg.medias = [
                    { type: MessageType.Image, url: 'https://images.urbndata.com/is/image/FreePeople/65516759_060_a' },
                    { type: MessageType.Image, url: 'https://assets.vincecamuto.com/is/image/vincecamuto/8200000000525012_001_ss_01' },
                    { type: MessageType.Image, url: 'https://cdn.shopify.com/s/files/1/0024/0274/6421/products/AA0122_1_a8300ad3-14f3-4df4-8f2c-efc759d48889.jpg' },
                    { type: MessageType.Image, url: 'https://cdn.shopify.com/s/files/1/0061/8627/0804/products/1-modelinfo-Juliette-us2_442811d7-c0e2-42c6-abe5-fc041fe204c0_large.jpg' },
                    { type: MessageType.Image, url: 'https://cottonon.com/on/demandware.static/-/Sites-catalog-master-women/default/dw36aee798/2052625/2052625-04-2.jpg' },
                    { type: MessageType.Image, url: 'https://images.urbndata.com/is/image/FreePeople/65516759_060_a' },
                    { type: MessageType.Image, url: 'https://images.urbndata.com/is/image/FreePeople/65516759_060_a' }
                ];
            }
            if (i % 4 === 1) {
                msg.medias = [
                    { type: MessageType.File, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'Dummy File 1',
                      downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileSizeInBytes: 23234 },
                      { type: MessageType.File, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'Dummy File 2',
                      downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileSizeInBytes: 2324 },
                      { type: MessageType.File, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'Dummy File 2',
                      downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileSizeInBytes: 2324 },
                      { type: MessageType.File, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'Dummy File 2',
                      downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileSizeInBytes: 2324 },
                      { type: MessageType.File, url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'Dummy File 2',
                      downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileSizeInBytes: 2324 }
                ];
            }

            if ((20-i) > 0) {
                msg.dateSent = new Date('2022-02-05T18:29:13.065Z');
            }
            if ((20-i) > 10) {
                msg.dateSent = new Date('2022-03-07T18:29:13.065Z');
            }
            if ((20-i) > 15) {
                msg.dateSent = new Date();
            }
            
            this.historyMessages.push(msg);
        }
    }

    getMessageHistory(destinataryId: any): Observable<Message[]> {
       console.log(`Loading Message History for ${destinataryId}`);
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
       console.log(`Loading Message History for ${destinataryId}. Page: ${page}, PageSize: ${pageSize}`);
       return of(mockedHistory.reverse()).pipe(delay(5000));
    }
    
    public listFriends(search?: string, pageSize?: number, page?: number) : Observable<ParticipantResponse[]> {
        console.log(search);
        let startPosition: number = (page-1) * pageSize;
        let endPosition: number = (page) * pageSize;
        console.log(`Loading friends. Page: ${page}, PageSize: ${pageSize}`);
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
        console.log(`Sending Message: ${message}`);
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
