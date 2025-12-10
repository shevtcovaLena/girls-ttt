'use client';

import { useGame } from '@/hooks/useGame';
import { useTelegram } from '@/hooks/useTelegram';
import { sendTelegramNotification } from '@/lib/telegram';
import GameStatus from './GameStatus';
import PromoCodeDisplay from './PromoCodeDisplay';
import TelegramBotLink from './TelegramBotLink';
import GameBoard from './GameBoard';
import PlayAgainButton from './PlayAgainButton';

type GameStatus = 'active' | 'won' | 'lost' | 'draw';

export default function GameView() {
  const telegramData = useTelegram();

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

  const isCellDisabled = (index: number): boolean => {
    return (
      board[index] !== null ||
      gameStatus !== 'active' ||
      isComputerThinking
    );
  };

  return (
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

      {lastPromoCode && gameStatus === 'won' && (
        <PromoCodeDisplay 
          promoCode={lastPromoCode} 
          hasUserId={!!telegramData.userId} 
        />
      )}

      <GameBoard
        board={board}
        lastMoveIndex={lastMoveIndex}
        onCellClick={handleCellClick}
        isCellDisabled={isCellDisabled}
      />

      {gameStatus !== 'active' && <PlayAgainButton onReset={resetGame} />}
    </div>
  );
}
