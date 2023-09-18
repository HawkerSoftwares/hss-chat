import { Message } from "./message";
import { User } from "./user";
import { ChatParticipantType } from "./chat-participant-type.enum";
import { ChatParticipantStatus } from "./chat-participant-status.enum";
import { Group } from "./group";
import { IChatParticipant } from "./chat-participant";
import { MessageCounter } from "./message-counter";

export class Window
{
    constructor(participant: IChatParticipant, isLoadingHistory: boolean, isCollapsed: boolean)
    {
        this.participant = participant;
        this.messages =  [];
        this.isLoadingHistory = isLoadingHistory;
        this.hasFocus = false; // This will be triggered when the 'newMessage' input gets the current focus
        this.isCollapsed = isCollapsed;
        this.hasMoreMessages = false;
        this.historyPage = 0;
    }

    public participant: IChatParticipant;    
    public messages: Message[] = [];
    public newMessage?: string = "";
    public preDefinedMessages?: string[] = [];

    // UI Behavior properties
    public isCollapsed?: boolean = false; 
    public isLoadingHistory: boolean = false;
    public hasFocus: boolean = false;
    public hasMoreMessages: boolean = true;
    public historyPage: number = 0;


    unreadMessagesTotal(userId: string): string {           
        return MessageCounter.unreadMessagesTotal(this, userId);
    }

    getChatWindowAvatar(message?: Message): string | null {
        if (this.participant.participantType == ChatParticipantType.User){
            return this.participant.avatar;
        } else if (this.participant.participantType == ChatParticipantType.Group) {
            let group = this.participant as Group;
            let userIndex = group.chattingTo.findIndex(x => x.id == message.fromId);

            return group.chattingTo[userIndex >= 0 ? userIndex : 0].avatar;
        }
        return null;
    }

}
