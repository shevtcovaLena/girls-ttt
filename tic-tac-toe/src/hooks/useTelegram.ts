import { useState, useEffect, useRef } from 'react';

interface TelegramWebApp {
  ready: () => void;
  initData: string;
  initDataUnsafe?: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramData {
  userId?: number;
  userName: string;
  isInitialized: boolean;
}

/**
 * Parses Telegram initData string to extract user information
 */
function parseInitData(initData: string): { userId?: number; userName?: string } {
  try {
    const params = new URLSearchParams(initData);
    const userParam = params.get('user');
    
    if (userParam) {
      const user = JSON.parse(decodeURIComponent(userParam));
      return {
        userId: user.id,
        userName: user.first_name || user.username || 'Player',
      };
    }
  } catch (error) {
    console.error('Error parsing initData:', error);
  }
  
  return {};
}

/**
 * Custom hook for Telegram WebApp initialization
 */
export function useTelegram(): TelegramData {
  const [telegramData, setTelegramData] = useState<TelegramData>({
    userId: undefined,
    userName: '',
    isInitialized: false,
  });

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initTelegram = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        
        if (tg.initDataUnsafe?.user) {
          const user = tg.initDataUnsafe.user;
          setTelegramData({
            userId: user.id,
            userName: user.first_name || user.username || 'Player',
            isInitialized: true,
          });
          return;
        } else if (tg.initData) {
          const { userId: parsedUserId, userName: parsedUserName } = parseInitData(tg.initData);
          if (parsedUserId) {
            setTelegramData({
              userId: parsedUserId,
              userName: parsedUserName || 'Player',
              isInitialized: true,
            });
            return;
          }
        }
      }
      
      setTelegramData((prev) => ({
        ...prev,
        isInitialized: true,
      }));
    };

    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      initTelegram();
    } else {
      const checkInterval = setInterval(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          clearInterval(checkInterval);
          initTelegram();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        setTelegramData((prev) => {
          if (!prev.isInitialized) {
            return { ...prev, isInitialized: true };
          }
          return prev;
        });
      }, 3000);
    }
  }, []);

  return telegramData;
}

