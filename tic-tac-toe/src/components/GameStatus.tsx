"use client";

import { useState, useEffect } from "react";
import LipstickIcon from "./LipstickIcon";

interface GameStatusProps {
  gameStatus: 'active' | 'won' | 'lost' | 'draw';
  isComputerThinking: boolean;
}

export default function GameStatus({ gameStatus, isComputerThinking }: GameStatusProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    setIsTouchDevice(hasTouch);
  }, []);

  const getStatusMessage = (): string => {
    if (gameStatus === 'won') return 'Вы выиграли! 🎉';
    if (gameStatus === 'lost') return 'Вы проиграли 😔';
    if (gameStatus === 'draw') return 'Ничья! 🤝';
    if (isComputerThinking) return 'Компьютер думает...';
    return 'Ваш ход';
  };

  const showIcon = isTouchDevice && gameStatus === 'active' && !isComputerThinking;

  return (
    <div className="text-center mb-8 text-xl font-semibold text-[var(--color-text-secondary)] flex items-center justify-center gap-2">
      <span>{getStatusMessage()}</span>
      {showIcon && (
        <LipstickIcon className="inline-block text-(--color-accent-3)" />
      )}
    </div>
  );
}
