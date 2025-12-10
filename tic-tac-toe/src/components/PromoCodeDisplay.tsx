import styles from '@/app/game.module.css';

interface PromoCodeDisplayProps {
  promoCode: string;
  hasUserId: boolean;
}

export default function PromoCodeDisplay({ promoCode, hasUserId }: PromoCodeDisplayProps) {
  return (
    <div className={`text-center mb-8 p-5 bg-(--color-bg-secondary) rounded-(--radius-large) shadow-(--shadow-strong) ${styles.winCelebration}`}>
      <p className="mb-3 text-base text-(--color-text-secondary)">
        Ваш промокод:
      </p>
      <div className="text-[28px] font-bold text-(--color-accent-3) tracking-wider" style={{ textShadow: '0 2px 8px rgba(202, 110, 135, 0.3)' }}>
        {promoCode}
      </div>
      {!hasUserId && (
        <p className="mt-3 text-sm text-(--color-text-light)">
          Промокод будет отправлен в Telegram при игре через бота
        </p>
      )}
    </div>
  );
}
