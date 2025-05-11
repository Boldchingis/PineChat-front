'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { SocketProvider } from './SocketContext';
import { ChatProvider } from './ChatContext';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <SocketProvider>
        <ChatProvider>
          {children}
        </ChatProvider>
      </SocketProvider>
    </AuthProvider>
  );
}