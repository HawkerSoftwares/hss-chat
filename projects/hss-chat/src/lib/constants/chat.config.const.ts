import { HSSChatConfig } from "../core/chat.config";

export const DEFAULT_CONFIG: HSSChatConfig = {
    showAvailabilityStatus: true,
    notification: {
      title: 'New message from',
      icon: ''
    },
    dashboard: {
      title: 'HSS Chat',
      profileImage: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
      emptyState: {
        title: 'Welcome',
        description: `Ready? Set. Chat! Let's jump right into things.`,
        image: 'https://image.freepik.com/free-vector/men-carry-things-concept-illustration-landing-page_273648-38.jpg'
      }
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