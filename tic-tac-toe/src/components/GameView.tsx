'use client';

import { useEffect, useRef } from 'react';
import { useGame } from '@/hooks/useGame';
import { useTelegram } from '@/hooks/useTelegram';
import { sendTelegramNotification } from '@/lib/telegram';
import GameStatus from './GameStatus';
import GameResultModal from './GameResultModal';
import TelegramBotLink from './TelegramBotLink';
import GameBoard from './GameBoard';

type GameStatus = 'active' | 'won' | 'lost' | 'draw';

export default function GameView() {
  const telegramData = useTelegram();
  const hasNotifiedLoss = useRef(false);

  const handleGameEnd = async (promoCode: string) => {
    if (telegramData.userId && promoCode) {
      await sendTelegramNotification(telegramData.userId, 'win', promoCode);
    }
  };

  const {
    board,
    gameStatus,
    lastPromoCode,
    isComputerThinking,
    lastMoveIndex,
    handleCellClick,
    resetGame,
  } = useGame(handleGameEnd);

  // Отправка уведомления о проигрыше
  useEffect(() => {
    if (gameStatus === 'lost' && telegramData.userId && !hasNotifiedLoss.current) {
      hasNotifiedLoss.current = true;
      sendTelegramNotification(telegramData.userId, 'lose');
    }
    // Сброс флага при сбросе игры
    if (gameStatus === 'active') {
      hasNotifiedLoss.current = false;
    }
  }, [gameStatus, telegramData.userId]);

  const isCellDisabled = (index: number): boolean => {
    return (
      board[index] !== null ||
      gameStatus !== 'active' ||
      isComputerThinking
    );
  };

  return (
    <>
      <div className="min-h-screen py-8 px-5 bg-[var(--color-bg-primary)] max-w-[600px] mx-auto">
        <h1 className="text-center mb-3 text-[var(--color-text-primary)] text-4xl font-bold">
          Крестики-Нолики
        </h1>
        
        {telegramData.userName && (
          <p className="text-center mb-5 text-[var(--color-text-secondary)] text-lg font-medium">
            Привет, {telegramData.userName}! 👋
          </p>
        )}
        
        {telegramData.isInitialized && !telegramData.userId && (
          <TelegramBotLink />
        )}

        <GameStatus gameStatus={gameStatus} isComputerThinking={isComputerThinking} />

        <GameBoard
          board={board}
          lastMoveIndex={lastMoveIndex}
          onCellClick={handleCellClick}
          isCellDisabled={isCellDisabled}
        />
      </div>

      {gameStatus !== 'active' && (
        <GameResultModal
          gameStatus={gameStatus}
          promoCode={gameStatus === 'won' ? lastPromoCode : null}
          hasUserId={!!telegramData.userId}
          onReset={resetGame}
        />
      )}
    </>
  );
}
