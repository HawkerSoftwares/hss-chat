import { ChatParticipantStatus } from './chat-participant-status.enum';

export interface StatusDescription {
    online: string;
    busy: string;
    away: string;
    offline: string;
    [key: string]: string;
}

const statusDescription: StatusDescription = {
    online: 'Online',
    busy: 'Busy',
    away: 'Away',
    offline: 'Offline'
};

export function chatParticipantStatusDescriptor(status: ChatParticipantStatus) {
    const currentStatus = ChatParticipantStatus[status].toString().toLowerCase();
    
    return statusDescription[currentStatus];
}