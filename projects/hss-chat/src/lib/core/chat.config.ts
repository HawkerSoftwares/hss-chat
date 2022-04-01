
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
}

export interface HSSChatConfig {
    showAvailabilityStatus: boolean;
    notification?: {
        title: string,
        icon: string;
    };
    participants?: HSSParticipantsWindowConfig;
    participantChat?: HSSParticipantChatWindowConfig
}