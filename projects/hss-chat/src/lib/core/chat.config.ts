
export interface HSSParticipantsWindowConfig {
    polling?: boolean,
    interval?: number
    pageSize?: number;
    headerTitle?: string;
    searchInputPlaceholder?: string;
    loadMoreContentText?: string;
}

export interface HSSParticipantChatWindowConfig {
    polling?: boolean,
    interval?: number
    pageSize?: number;
    inputPlaceholder?: string;
    loadMoreContentText?: string;
    preDefinedMessagesEnabled?: boolean;
}

export interface HSSChatConfig {
    showAvailabilityStatus?: boolean;
    preDefinedMessages?: string[];
    notification?: {
        title: string,
        icon: string;
    };
    dashboard?: {
        title: string,
        profileIcon?: string;
        profileImage?: string,
        emptyState?: {
            title?: string,
            description?: string,
            image?: string
        }
    }
    participants?: HSSParticipantsWindowConfig;
    participantChat?: HSSParticipantChatWindowConfig
}