"use client";

import { useState } from "react";
import styles from "@/app/game.module.css";
import CopyIcon from "./CopyIcon";

interface PromoCodeDisplayProps {
  promoCode: string;
  hasUserId: boolean;
}

export default function PromoCodeDisplay({
  promoCode,
  hasUserId,
}: PromoCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className={`text-center mb-8 p-5 bg-(--color-bg-secondary) rounded-(--radius-large) shadow-(--shadow-strong) ${styles.winCelebration}`}
    >
      <p className="mb-3 text-base text-(--color-text-secondary)">
        Ваш промокод:
      </p>
      <div className="flex items-center justify-center gap-3">
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
        <p className="mt-3 text-sm text-(--color-text-light)">
          Промокод будет отправлен в Telegram при игре через бота
        </p>
      )}
    </div>
  );
}
