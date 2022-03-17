import { MessageType } from './message-type.enum';

export class Message
{
    public id?: any;
    public type?: MessageType = MessageType.Text;
    public fromId: any;
    public toId: any;
    public message: string;
    public dateSent?: Date;
    public dateSeen?: Date;
    public mediaUrl?: string;
    public downloadUrl?: string;
    public mimeType?: string;
    public fileSizeInBytes?: number = 0;
}
