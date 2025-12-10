import styles from '@/app/game.module.css';

export default function TelegramBotLink() {
  const telegramBotUrl =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/your_bot_username';

  return (
    <div className="text-center mb-8 p-5 bg-[var(--color-bg-secondary)] rounded-[var(--radius-large)] shadow-[var(--shadow-soft)]">
      <p className="mb-4 text-base text-[var(--color-text-secondary)]">
        💄 Для получения промокодов откройте игру в Telegram боте
      </p>
      <a
        href={telegramBotUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-block px-7 py-3.5 text-base font-semibold bg-[var(--color-button)] text-white no-underline border-none rounded-[var(--radius-button)] cursor-pointer shadow-[var(--shadow-soft)] ${styles.buttonPrimary}`}
      >
        Открыть в Telegram
      </a>
    </div>
  );
}
