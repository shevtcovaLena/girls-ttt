"use client";

import { useState, useEffect } from "react";
import styles from "@/app/game.module.css";
import CopyIcon from "./CopyIcon";

type GameStatus = 'won' | 'lost' | 'draw';

interface GameResultModalProps {
  gameStatus: GameStatus;
  promoCode?: string | null;
  hasUserId: boolean;
  onReset: () => void;
}

const confettiColors = ['#ca6e87', '#d88ba0', '#f5a8bd', '#ffc4d6', '#8cd4bb', '#79bba5'];

export default function GameResultModal({
  gameStatus,
  promoCode,
  hasUserId,
  onReset,
}: GameResultModalProps) {
  const [copied, setCopied] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (gameStatus === 'won') {
      // Создаем конфетти при победе
      const pieces = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      }));
      setConfetti(pieces);
    }
  }, [gameStatus]);

  const handleCopy = async () => {
    if (!promoCode) return;
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getTitle = () => {
    switch (gameStatus) {
      case 'won':
        return 'Вы выиграли! 🎉';
      case 'lost':
        return 'Вы проиграли 😔';
      case 'draw':
        return 'Ничья! 🤝';
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div
        className={`${styles.modalContent} relative text-center p-8 bg-(--color-bg-secondary) rounded-(--radius-large) shadow-(--shadow-strong) max-w-md w-full mx-4 overflow-hidden ${
          gameStatus === 'won' ? styles.winCelebration : ''
        }`}
      >
        {gameStatus === 'won' && (
          <>
            <div className={styles.confettiContainer}>
              {confetti.map((piece) => (
                <div
                  key={piece.id}
                  className={styles.confettiPiece}
                  style={{
                    left: `${piece.left}%`,
                    background: piece.color,
                    animationDelay: `${piece.delay}s`,
                    animationDuration: `${2 + Math.random() * 1}s`,
                  }}
                />
              ))}
            </div>
            <div className={styles.sparkle + ' ' + styles.sparkle1}></div>
            <div className={styles.sparkle + ' ' + styles.sparkle2}></div>
            <div className={styles.sparkle + ' ' + styles.sparkle3}></div>
            <div className={styles.sparkle + ' ' + styles.sparkle4}></div>
            <div className={styles.sparkle + ' ' + styles.sparkle5}></div>
          </>
        )}
        
        <h2 className="text-2xl font-bold text-(--color-text-primary) mb-6 relative z-10">
          {getTitle()}
        </h2>

        {gameStatus === 'won' && promoCode && (
          <>
            <p className="mb-3 text-base text-(--color-text-secondary) relative z-10">
              Ваш промокод:
            </p>
            <div className="flex items-center justify-center gap-3 mb-6 relative z-10">
              <div
                className="text-[28px] font-bold text-(--color-accent-3) tracking-wider"
                style={{ textShadow: "0 2px 8px rgba(202, 110, 135, 0.3)" }}
              >
                {promoCode}
              </div>
              <button
                onClick={handleCopy}
                className="relative flex items-center justify-center p-2 rounded-lg transition-colors hover:bg-(--color-accent-2) group"
                aria-label={copied ? "Скопировано!" : "Скопировать промокод"}
              >
                <CopyIcon
                  className={`transition-transform text-(--color-mark-o) w-7 h-7 ${
                    copied ? "scale-110" : ""
                  }`}
                />

                {copied && (
                  <span
                    className={`${styles.tooltip} px-3 py-1.5 bg-(--color-mark-o) text-white text-sm rounded-lg shadow-lg whitespace-nowrap`}
                  >
                    Скопировано!
                    <span className={styles.tooltipArrow}></span>
                  </span>
                )}
              </button>
            </div>
            {!hasUserId && (
              <p className="mb-6 text-sm text-(--color-text-light) relative z-10">
                Промокод будет отправлен в Telegram при игре через бота
              </p>
            )}
          </>
        )}

        {gameStatus === 'lost' && (
          <p className="mb-6 text-base text-(--color-text-secondary)">
            Попробуйте еще раз! Удачи! 💪
          </p>
        )}

        {gameStatus === 'draw' && (
          <p className="mb-6 text-base text-(--color-text-secondary)">
            Отличная игра! Попробуйте еще раз! 🎯
          </p>
        )}

        <button
          onClick={onReset}
          className={`w-full px-8 py-4 text-lg font-semibold bg-(--color-button) text-white border-none rounded-(--radius-button) cursor-pointer shadow-(--shadow-soft) ${styles.buttonPrimary} relative z-10`}
        >
          Играть снова
        </button>
      </div>
    </div>
  );
}
