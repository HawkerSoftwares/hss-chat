import { MessageType } from './message-type.enum';

export interface IMedia {
    id?: any;
    title?:string;
    type: MessageType;
    url: string
    downloadUrl?: string;
    mimeType?: string;
    fileSizeInBytes?: number;
}

export class Message
{
    public id?: any;
    public fromId: any;
    public toId: any;
    public message: string;
    public dateSent?: Date;
    public dateSeen?: Date;
    public medias?: IMedia[];
    public formattedDate?: string | null;
    public newDateStarted?: boolean;
    public reactions?: any[]
}

export interface IMessageSeen {
    destinataryId: string,
    messages: Message[],
    success: Function
}