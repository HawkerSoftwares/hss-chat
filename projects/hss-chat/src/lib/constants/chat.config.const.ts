import { HSSChatConfig } from "../core/chat.config";

export const DEFAULT_CONFIG: HSSChatConfig = {
    showAvailabilityStatus: true,
    notification: {
      title: 'New message from',
      icon: ''
    },
    dashboard: {
      title: 'HSS Chat',
      profileImage: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png'
    },
    participants: {
      polling: true,
      interval: 30000,
      pageSize: 10,
      searchInputPlaceholder: 'Search',
      loadMoreContentText: 'Load more',
      headerTitle: 'Participants'
    },
    participantChat: {
      polling: true,
      interval: 30000,
      pageSize: 10,
      inputPlaceholder: 'Type a message',
      loadMoreContentText: 'Load older messages',
      preDefinedMessagesEnabled: false
    }
  }