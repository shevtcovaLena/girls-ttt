'use client';

import { useTelegram } from '@/hooks/useTelegram';
import GameView from '@/components/GameView';
import LoadingView from '@/components/LoadingView';

export default function Home() {
  const telegramData = useTelegram();

  if (!telegramData.isInitialized) {
    return <LoadingView />;
  }

  return <GameView />;
}
