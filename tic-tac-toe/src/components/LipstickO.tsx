import styles from '@/app/game.module.css';

/**
 * SVG компонент для O с текстурой помады
 */
export default function LipstickO() {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lipstickGradientO" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60ae94" />
          <stop offset="25%" stopColor="#79bba5" />
          <stop offset="50%" stopColor="#60ae94" />
          <stop offset="75%" stopColor="#4f9f82" />
          <stop offset="100%" stopColor="#60ae94" />
        </linearGradient>
        <filter id="glowO">
          <feGaussianBlur stdDeviation="1.2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Тень для глубины */}
      <circle
        cx="30"
        cy="30"
        r="18"
        stroke="rgba(90, 105, 100, 0.2)"
        strokeWidth="6"
        fill="none"
        opacity="0.4"
      />
      
      {/* Круг O - тоньше линия */}
      <circle
        cx="30"
        cy="30"
        r="18"
        stroke="url(#lipstickGradientO)"
        strokeWidth="5"
        fill="none"
        filter="url(#glowO)"
        className={styles.drawStrokeCircle}
        style={{
          strokeDasharray: 113.1,
          strokeDashoffset: 113.1,
        }}
      />
      
      {/* Текстура бликов - несколько бликов для объема */}
      <ellipse
        cx="25"
        cy="25"
        rx="8"
        ry="12"
        fill="rgba(255, 255, 255, 0.35)"
        opacity="0.7"
      />
      <ellipse
        cx="28"
        cy="22"
        rx="5"
        ry="8"
        fill="rgba(255, 255, 255, 0.25)"
        opacity="0.5"
      />
      
      {/* Дополнительная текстура - блики по кругу */}
      <path
        d="M 30 12 Q 35 15 38 20"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M 48 30 Q 45 35 40 38"
        stroke="rgba(255, 255, 255, 0.15)"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}
