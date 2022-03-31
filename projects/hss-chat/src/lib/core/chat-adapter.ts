import { delay, Observable, of } from 'rxjs';
import { Message } from "./message";
import { ParticipantResponse } from "./participant-response";
import { IChatParticipant } from './chat-participant';

export abstract class ChatAdapter
{
    // ### Abstract adapter methods ###
    public abstract listFriends(search: string, pageSize: number, page: number) : Observable<ParticipantResponse[]>;
    
    public abstract getMessageHistory(destinataryId: any): Observable<Message[]>;

    public abstract sendMessage(message: Message): void;

    // ### Adapter/Chat income/ingress events ###

    public onFriendsListChanged(participantsResponse: ParticipantResponse[]): void
    {
        this.friendsListChangedHandler(participantsResponse);
    }

    public onMessageReceived(participant: IChatParticipant, message: Message): void
    {
        this.messageReceivedHandler(participant, message);
    }

    public getRecentMessages(destinataryId: any, message: Message): Observable<Message[]> {
        console.error('Polling not supported yet. Please override "getRecentMessages" in your ChatAdapter.');
        return of([]).pipe(delay(500));
    };
    
    // Event handlers
    /** @internal */
    friendsListChangedHandler: (participantsResponse: ParticipantResponse[]) => void  = (participantsResponse: ParticipantResponse[]) => {};
    /** @internal */
    messageReceivedHandler: (participant: IChatParticipant, message: Message) => void = (participant: IChatParticipant, message: Message) => {};
}
