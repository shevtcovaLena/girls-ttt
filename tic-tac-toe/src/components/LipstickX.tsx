import styles from '@/app/game.module.css';

/**
 * SVG компонент для X с текстурой помады
 */
export default function LipstickX() {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lipstickGradientX" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ca6e87" />
          <stop offset="30%" stopColor="#d88ba0" />
          <stop offset="60%" stopColor="#c97d94" />
          <stop offset="100%" stopColor="#b85a75" />
        </linearGradient>
        <linearGradient id="lipstickGradientX2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b85a75" />
          <stop offset="50%" stopColor="#ca6e87" />
          <stop offset="100%" stopColor="#d88ba0" />
        </linearGradient>
        <filter id="glowX">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Тень для глубины */}
      <path
        d="M15 15 L45 45"
        stroke="rgba(90, 105, 100, 0.3)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
      <path
        d="M45 15 L15 45"
        stroke="rgba(90, 105, 100, 0.3)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
      
      {/* Первая линия X */}
      <path
        d="M15 15 L45 45"
        stroke="url(#lipstickGradientX)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glowX)"
        className={styles.drawStroke}
        style={{
          strokeDasharray: 42.43,
          strokeDashoffset: 42.43,
        }}
      />
      
      {/* Вторая линия X */}
      <path
        d="M45 15 L15 45"
        stroke="url(#lipstickGradientX2)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glowX)"
        className={styles.drawStrokeDelayed}
        style={{
          strokeDasharray: 42.43,
          strokeDashoffset: 42.43,
        }}
      />
      
      {/* Текстура бликов */}
      <path
        d="M20 20 L35 20"
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M25 25 L40 25"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      
      {/* Текстура блика на пересечении */}
      <circle
        cx="30"
        cy="30"
        r="3"
        fill="rgba(255, 255, 255, 0.4)"
        opacity="0.8"
      />
    </svg>
  );
}
