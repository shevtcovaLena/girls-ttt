import { useState } from 'react';
import { type Board } from '@/lib/gameLogic';
import LipstickX from './LipstickX';
import LipstickO from './LipstickO';
import styles from '@/app/game.module.css';

interface GameBoardProps {
  board: Board;
  lastMoveIndex: number | null;
  onCellClick: (index: number) => void;
  isCellDisabled: (index: number) => boolean;
}

export default function GameBoard({
  board,
  lastMoveIndex,
  onCellClick,
  isCellDisabled,
}: GameBoardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={`${styles.gameBoard} grid gap-3 justify-center mb-10 grid-cols-[repeat(3,100px)] grid-rows-[repeat(3,100px)]`}>
      {board.map((cell, index) => {
        const isLastMove = lastMoveIndex === index;
        const isComputerMove = isLastMove && cell === 'O';
        const disabled = isCellDisabled(index);
        const isHovered = hoveredIndex === index && !disabled;
        
        return (
          <button
            key={index}
            onClick={() => onCellClick(index)}
            disabled={disabled}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`
              ${styles.cellButton}
              w-[100px] h-[100px] text-4xl font-bold
              bg-[var(--color-bg-secondary)]
              rounded-[var(--radius-medium)]
              flex items-center justify-center
              p-0 relative overflow-hidden
              ${cell ? styles.cellButtonFilled : ''}
              ${disabled && !cell ? styles.cellButtonDisabled : ''}
              ${isComputerMove ? styles.cellAppear : ''}
              ${isHovered ? styles.cellButtonHover : ''}
              ${cell === 'X' ? styles.cellMarkX : cell === 'O' ? styles.cellMarkO : ''}
            `}
          >
            {!cell && !disabled && (
              <div
                className={`${styles.shineOverlay} ${isHovered ? styles.shineOverlayActive : ''}`}
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
  );
}
