'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

interface Message {
  id: number;
  content: string;
  senderId: number;
  chatId: number;
  createdAt: string;
  timestamp?: string;
  sender?: {
    id: number;
    name: string;
    email: string;
    profile?: {
      id: number;
      image: string;
      about?: string;
    } | null;
  };
}

interface ChatUser {
  id: number;
  name: string;
  email: string;
  profile?: {
    id: number;
    image: string;
    about?: string;
  } | null;
}

interface Chat {
  id: number;
  name?: string | null;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  participants: ChatUser[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
  displayName?: string;
  picture?: string | null;
}

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (content: string) => Promise<boolean>;
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: number) => Promise<void>;
  createChat: (userId: number) => Promise<Chat | null>;
  searchUsers: (query: string) => Promise<ChatUser[]>;
}

const ChatContext = createContext<ChatContextType>({
  chats: [],
  activeChat: null,
  messages: [],
  isLoadingChats: false,
  isLoadingMessages: false,
  setActiveChat: () => {},
  sendMessage: async () => false,
  fetchChats: async () => {},
  fetchMessages: async () => {},
  createChat: async () => null,
  searchUsers: async () => [],
});

export const useChat = () => useContext(ChatContext);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const { socket, isConnected } = useSocket();
  const { user, isAuthenticated } = useAuth();

  const fetchChats = useCallback(async () => {
    if (!isAuthenticated || typeof window === 'undefined') return;

    setIsLoadingChats(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/chat', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      if (data.success) {
        setChats(data.data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoadingChats(false);
    }
  }, [isAuthenticated]);

  const fetchMessages = useCallback(
    async (chatId: number) => {
      if (!isAuthenticated || typeof window === 'undefined') return;

      setIsLoadingMessages(true);

      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:5000/chat/${chatId}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        if (data.success) {
          setMessages(data.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [isAuthenticated]
  );

  const createChat = async (userId: number): Promise<Chat | null> => {
    if (!isAuthenticated || typeof window === 'undefined') return null;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          participants: [userId],
          isGroup: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const data = await response.json();
      if (data.success) {
        if (data.code !== 'CHAT_EXISTS') {
          setChats((prevChats) => [data.data, ...prevChats]);
        }
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  };

  const searchUsers = async (query: string): Promise<ChatUser[]> => {
    if (!isAuthenticated || !query.trim() || typeof window === 'undefined') return [];

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `http://localhost:5000/chat/search/users?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  const sendMessage = async (content: string): Promise<boolean> => {
    if (!isAuthenticated || !activeChat || !content.trim() || !socket || typeof window === 'undefined') {
      return false;
    }

    try {
      if (activeChat.isGroup) {
        socket.emit('group_message', {
          content,
          chatId: activeChat.id,
        });
      } else {
        const recipient = activeChat.participants.find((p) => p.id !== user?.id);
        if (!recipient) return false;

        socket.emit('private_message', {
          content,
          chatId: activeChat.id,
          receiverId: recipient.id,
        });
      }

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !socket || !isConnected) return;

    socket.on('new_message', (message: Message) => {
      if (activeChat && message.chatId === activeChat.id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === message.chatId) {
            return {
              ...chat,
              lastMessage: message,
              updatedAt: new Date().toISOString(),
            };
          }
          return chat;
        })
      );
    });

    socket.on('message_sent', (message: Message) => {
      if (activeChat && message.chatId === activeChat.id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === message.chatId) {
            return {
              ...chat,
              lastMessage: message,
              updatedAt: new Date().toISOString(),
            };
          }
          return chat;
        })
      );
    });

    socket.on('user_status', ({ userId, status }) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (!chat.isGroup) {
            const updatedParticipants = chat.participants.map((p) =>
              p.id === userId ? { ...p, status } : p
            );
            return { ...chat, participants: updatedParticipants };
          }
          return chat;
        })
      );
    });

    return () => {
      socket.off('new_message');
      socket.off('message_sent');
      socket.off('user_status');
    };
  }, [socket, isConnected, activeChat]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isAuthenticated) {
      fetchChats();
    }
  }, [fetchChats, isAuthenticated]);

  useEffect(() => {
    if (typeof window === 'undefined' || !socket || !isConnected || !activeChat) return;

    socket.emit('join_chat', activeChat.id.toString());

    fetchMessages(activeChat.id);

    return () => {
      if (activeChat) {
        socket.emit('leave_chat', activeChat.id.toString());
      }
    };
  }, [socket, isConnected, activeChat, fetchMessages]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        messages,
        isLoadingChats,
        isLoadingMessages,
        setActiveChat,
        sendMessage,
        fetchChats,
        fetchMessages,
        createChat,
        searchUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
