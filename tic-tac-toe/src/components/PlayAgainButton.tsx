import styles from '@/app/game.module.css';

interface PlayAgainButtonProps {
  onReset: () => void;
}

export default function PlayAgainButton({ onReset }: PlayAgainButtonProps) {
  return (
    <div className="text-center">
      <button
        onClick={onReset}
        className={`px-8 py-4 text-lg font-semibold bg-[var(--color-button)] text-white border-none rounded-[var(--radius-button)] cursor-pointer shadow-[var(--shadow-soft)] ${styles.buttonPrimary}`}
      >
        Играть снова
      </button>
    </div>
  );
}
