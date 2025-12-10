'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  initializeBoard,
  calculateWinner,
  isBoardFull,
  isValidMove,
  getComputerMove,
  type Board,
} from '@/lib/gameLogic';
import { generatePromoCode } from '@/lib/generatePromoCode';
import { sendTelegramNotification } from '@/lib/telegram';
import LipstickX from '@/components/LipstickX';
import LipstickO from '@/components/LipstickO';

type GameStatus = 'active' | 'won' | 'lost' | 'draw';

/**
 * Telegram WebApp interface
 */
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

/**
 * Extends Window interface to include Telegram WebApp
 */
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

/**
 * Parses Telegram initData string to extract user information
 */
function parseInitData(initData: string): { userId?: number; userName?: string } {
  try {
    // Parse URL-encoded initData
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
 * Custom hook for managing game state and logic
 */
function useGame(userId?: number, onGameEnd?: (promoCode: string) => void) {
  const [board, setBoard] = useState<Board>(initializeBoard);
  const [gameStatus, setGameStatus] = useState<GameStatus>('active');
  const [lastPromoCode, setLastPromoCode] = useState<string | null>(null);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [lastMoveIndex, setLastMoveIndex] = useState<number | null>(null);

  /**
   * Handles player's cell click
   */
  const handleCellClick = useCallback(
    async (index: number) => {
      // Block clicks if game is over or computer is thinking
      if (gameStatus !== 'active' || isComputerThinking) {
        return;
      }

      // Validate move
      if (!isValidMove(board, index)) {
        return;
      }

      // Player makes move (X)
      const newBoard: Board = [...board] as Board;
      newBoard[index] = 'X';
      setBoard(newBoard);
      setLastMoveIndex(index);

      // Check for player win
      const winner = calculateWinner(newBoard);
      if (winner === 'X') {
        const promoCode = generatePromoCode();
        setLastPromoCode(promoCode);
        setGameStatus('won');
        // Send Telegram notification via callback (only on win)
        if (onGameEnd) {
          onGameEnd(promoCode);
        }
        return;
      }

      // Check for draw
      if (isBoardFull(newBoard)) {
        setGameStatus('draw');
        return;
      }

      // Computer's turn
      setIsComputerThinking(true);
      
      // Add delay to simulate computer thinking (800-1000ms for better UX)
      await new Promise((resolve) => setTimeout(resolve, 900));

      const computerMove = getComputerMove(newBoard);
      if (computerMove !== -1) {
        const boardAfterComputer: Board = [...newBoard] as Board;
        boardAfterComputer[computerMove] = 'O';
        setBoard(boardAfterComputer);
        setLastMoveIndex(computerMove);

        // Check for computer win
        const winnerAfterComputer = calculateWinner(boardAfterComputer);
        if (winnerAfterComputer === 'O') {
          setGameStatus('lost');
          setIsComputerThinking(false);
          // No notification sent on loss
          return;
        }

        // Check for draw after computer move
        if (isBoardFull(boardAfterComputer)) {
          setGameStatus('draw');
          setIsComputerThinking(false);
          return;
        }
      }

      setIsComputerThinking(false);
    },
    [board, gameStatus, isComputerThinking, onGameEnd]
  );

  /**
   * Resets the game to initial state
   */
  const resetGame = useCallback(() => {
    setBoard(initializeBoard());
    setGameStatus('active');
    setLastPromoCode(null);
    setIsComputerThinking(false);
    setLastMoveIndex(null);
  }, []);

  return {
    board,
    gameStatus,
    lastPromoCode,
    isComputerThinking,
    lastMoveIndex,
    handleCellClick,
    resetGame,
  };
}

export default function Home() {
  const [telegramData, setTelegramData] = useState<{
    userId?: number;
    userName: string;
    isInitialized: boolean;
  }>({
    userId: undefined,
    userName: '',
    isInitialized: false,
  });

  const initializedRef = useRef(false);

  // Initialize Telegram WebApp after component mounts
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Wait for Telegram WebApp SDK to load
    const initTelegram = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Notify Telegram that the app is ready
        tg.ready();
        
        // Try to get user data from initDataUnsafe (easier but less secure)
        if (tg.initDataUnsafe?.user) {
          const user = tg.initDataUnsafe.user;
          setTelegramData({
            userId: user.id,
            userName: user.first_name || user.username || 'Player',
            isInitialized: true,
          });
          return;
        } else if (tg.initData) {
          // Parse initData manually
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
      
      // Mark as initialized even if no user data (not in Telegram context or no data)
      setTelegramData((prev) => ({
        ...prev,
        isInitialized: true,
      }));
    };

    // Check if Telegram WebApp is already loaded
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      initTelegram();
    } else {
      // Wait for script to load
      const checkInterval = setInterval(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          clearInterval(checkInterval);
          initTelegram();
        }
      }, 100);

      // Timeout after 3 seconds
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

  // Callback for game end events (only for wins with promo code)
  const handleGameEnd = useCallback(
    async (promoCode: string) => {
      if (telegramData.userId) {
        await sendTelegramNotification(telegramData.userId, 'win', promoCode);
      }
    },
    [telegramData.userId]
  );

  const {
    board,
    gameStatus,
    lastPromoCode,
    isComputerThinking,
    lastMoveIndex,
    handleCellClick,
    resetGame,
  } = useGame(telegramData.userId, handleGameEnd);

  // Determine status message
  const getStatusMessage = (): string => {
    if (gameStatus === 'won') return 'Вы выиграли! 🎉';
    if (gameStatus === 'lost') return 'Вы проиграли 😔';
    if (gameStatus === 'draw') return 'Ничья! 🤝';
    if (isComputerThinking) return 'Компьютер думает...';
    return 'Ваш ход';
  };

  // Check if cell is disabled
  const isCellDisabled = (index: number): boolean => {
    return (
      board[index] !== null ||
      gameStatus !== 'active' ||
      isComputerThinking
    );
  };

  // Telegram bot URL (can be set via environment variable)
  // Default to a placeholder that should be replaced with actual bot URL
  const telegramBotUrl =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/your_bot_username';

  // Show loading state while initializing
  if (!telegramData.isInitialized) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg-primary)',
        }}
      >
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '18px' }}>
          Загрузка...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '32px 20px',
        background: 'var(--color-bg-primary)',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          marginBottom: '12px',
          color: 'var(--color-text-primary)',
          fontSize: '2.5rem',
          fontWeight: 700,
        }}
      >
        Крестики-Нолики
      </h1>
      {telegramData.userName && (
        <p
          style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: 'var(--color-text-secondary)',
            fontSize: '18px',
            fontWeight: 500,
          }}
        >
          Привет, {telegramData.userName}! 👋
        </p>
      )}
      
      {/* Telegram bot link if not opened from Telegram */}
      {telegramData.isInitialized && !telegramData.userId && (
        <div
          style={{
            textAlign: 'center',
            marginBottom: '32px',
            padding: '20px',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-large)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <p
            style={{
              marginBottom: '16px',
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
            }}
          >
            💄 Для получения промокодов откройте игру в Telegram боте
          </p>
          <a
            href={telegramBotUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: 600,
              backgroundColor: 'var(--color-button)',
              color: 'white',
              textDecoration: 'none',
              border: 'none',
              borderRadius: 'var(--radius-button)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-soft)',
              transition: 'all 0.2s ease-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-button-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-medium)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-button)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
            }}
          >
            Открыть в Telegram
          </a>
        </div>
      )}

      {/* Game Status */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '32px',
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
        }}
      >
        {getStatusMessage()}
      </div>

      {/* Promo Code Display */}
      {lastPromoCode && gameStatus === 'won' && (
        <div
          style={{
            textAlign: 'center',
            marginBottom: '32px',
            padding: '20px',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-large)',
            boxShadow: 'var(--shadow-strong)',
            animation: 'winCelebration 0.6s ease-out',
          }}
        >
          <p
            style={{
              marginBottom: '12px',
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
            }}
          >
            Ваш промокод:
          </p>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--color-accent-3)',
              letterSpacing: '0.1em',
              textShadow: '0 2px 8px rgba(202, 110, 135, 0.3)',
            }}
          >
            {lastPromoCode}
          </div>
          {!telegramData.userId && (
            <p
              style={{
                marginTop: '12px',
                fontSize: '14px',
                color: 'var(--color-text-light)',
                fontStyle: 'italic',
              }}
            >
              Промокод будет отправлен в Telegram при игре через бота
            </p>
          )}
        </div>
      )}

      {/* Game Board */}
      <div
        className="game-board"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 100px)',
          gridTemplateRows: 'repeat(3, 100px)',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '40px',
        }}
      >
        {board.map((cell, index) => {
          const isLastMove = lastMoveIndex === index;
          const isComputerMove = isLastMove && cell === 'O'; // Анимация только для хода компьютера
          
          return (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              disabled={isCellDisabled(index)}
              style={{
                width: '100px',
                height: '100px',
                fontSize: '36px',
                fontWeight: 700,
                backgroundColor: cell
                  ? 'var(--color-bg-secondary)'
                  : 'var(--color-bg-secondary)',
                border: `2px solid ${cell ? 'var(--color-accent-1)' : 'var(--color-secondary)'}`,
                borderRadius: 'var(--radius-medium)',
                color: cell === 'X' ? 'var(--color-mark-x)' : 'var(--color-mark-o)',
                boxShadow: cell
                  ? 'var(--shadow-soft)'
                  : 'none',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: isCellDisabled(index) && !cell ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                position: 'relative',
                overflow: 'hidden',
                animation: isComputerMove
                  ? 'cellAppear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  : undefined,
              }}
              onMouseEnter={(e) => {
                if (!isCellDisabled(index)) {
                  e.currentTarget.style.transform = 'scale(1.08)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-medium)';
                  e.currentTarget.style.borderColor = 'var(--color-accent-3)';
                  
                  // Активировать блик для пустых клеток
                  if (!cell) {
                    const shineOverlay = e.currentTarget.querySelector('.shine-overlay') as HTMLElement;
                    if (shineOverlay) {
                      shineOverlay.style.opacity = '1';
                      shineOverlay.style.animation = 'shine 0.6s ease-out';
                    }
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!isCellDisabled(index)) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = cell ? 'var(--shadow-soft)' : 'none';
                  e.currentTarget.style.borderColor = cell
                    ? 'var(--color-accent-1)'
                    : 'var(--color-secondary)';
                  
                  // Убрать блик
                  const shineOverlay = e.currentTarget.querySelector('.shine-overlay') as HTMLElement;
                  if (shineOverlay) {
                    shineOverlay.style.opacity = '0';
                    shineOverlay.style.animation = 'none';
                  }
                }
              }}
            >
              {/* Блик эффект при наведении */}
              {!cell && !isCellDisabled(index) && (
                <div
                  className="shine-overlay"
                  style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                  }}
                />
              )}
              
              {cell === 'X' ? (
                <LipstickX />
              ) : cell === 'O' ? (
                <LipstickO />
              ) : (
                ''
              )}
            </button>
          );
        })}
      </div>

      {/* Play Again Button */}
      {gameStatus !== 'active' && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={resetGame}
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: 600,
              backgroundColor: 'var(--color-button)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-button)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-soft)',
              transition: 'all 0.2s ease-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-button-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-medium)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-button)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
            }}
          >
            Играть снова
          </button>
        </div>
      )}
    </div>
  );
}
