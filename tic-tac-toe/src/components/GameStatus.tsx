interface GameStatusProps {
  gameStatus: 'active' | 'won' | 'lost' | 'draw';
  isComputerThinking: boolean;
}

export default function GameStatus({ gameStatus, isComputerThinking }: GameStatusProps) {
  const getStatusMessage = (): string => {
    if (gameStatus === 'won') return 'Вы выиграли! 🎉';
    if (gameStatus === 'lost') return 'Вы проиграли 😔';
    if (gameStatus === 'draw') return 'Ничья! 🤝';
    if (isComputerThinking) return 'Компьютер думает...';
    return 'Ваш ход';
  };

  return (
    <div className="text-center mb-8 text-xl font-semibold text-[var(--color-text-secondary)]">
      {getStatusMessage()}
    </div>
  );
}
