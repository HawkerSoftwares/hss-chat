import { HSSChatConfig } from "../core/chat.config";

export const DEFAULT_CONFIG: HSSChatConfig = {
    showAvailabilityStatus: true,
    notification: {
      title: 'New message from',
      icon: ''
    },
    participants: {
      polling: true,
      interval: 5000,
      pageSize: 10,
      searchInputPlaceholder: 'Search',
      loadMoreContentText: 'Load more',
      headerTitle: 'Participants'
    },
    participantChat: {
      polling: true,
      interval: 5000,
      pageSize: 10,
      inputPlaceholder: 'Type a message',
      loadMoreContentText: 'Load older messages'
    }
  }