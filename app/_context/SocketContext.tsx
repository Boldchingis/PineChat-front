'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Socket } from 'socket.io-client';

// Define interface for Socket context
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectToSocket: () => void;
  disconnectSocket: () => void;
}

// Create context with default values
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectToSocket: () => {},
  disconnectSocket: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();

  // Function to connect to socket server
  const connectToSocket = () => {
    // Check if running in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Disconnect existing socket if any
    if (socket) {
      socket.disconnect();
    }

    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No access token found');
      router.push('/auth');
      return;
    }

    try {
      // Dynamically import socket.io-client to avoid SSR issues
      import('socket.io-client').then(({ io }) => {
        // Create new socket connection
        const newSocket = io('http://localhost:5000', {
          auth: {
            token: `Bearer ${token}`,
          },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        // Set up event listeners
        newSocket.on('connect', () => {
          console.log('Connected to socket server');
          setIsConnected(true);
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);

          // If authentication fails, redirect to login
          if (error.message.includes('Authentication error')) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/auth');
          }

          setIsConnected(false);
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from socket server');
          setIsConnected(false);
        });

        // Set socket in state
        setSocket(newSocket);
      });
    } catch (error) {
      console.error('Error creating socket:', error);
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  // Connect when component mounts if auth token exists
  useEffect(() => {
    // Check if running in browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        connectToSocket();
      }

      // Clean up on unmount
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }

  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectToSocket, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  );
}