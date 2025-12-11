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
        {/* Линейный градиент по диагонали для видимого перехода */}
        <linearGradient id="brushStrokeO" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c5f5e7" />
          <stop offset="30%" stopColor="#8cd4bb" />
          <stop offset="60%" stopColor="#60ae94" />
          <stop offset="100%" stopColor="#3d8a6f" />
        </linearGradient>
      </defs>
      
      {/* Тонкая тень */}
      <path
        d="M 40 7
           Q 48 8, 52 18
           Q 56 28, 52 38
           Q 48 48, 38 52
           Q 28 56, 18 52
           Q 8 48, 6 38
           Q 4 28, 8 18
           Q 12 10, 22 8
           Q 26 7, 30 9
           Q 32 10, 33 12"
        stroke="rgba(90, 105, 100, 0.25)"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        style={{ filter: 'blur(1px)' }}
        transform="translate(1, 1)"
      />
      
      {/* Разомкнутый круг со спиральным заходом и текстурой */}
      <path
        d="M 40 5
           Q 48 8, 52 18
           Q 56 28, 52 38
           Q 48 48, 38 52
           Q 28 56, 18 52
           Q 8 48, 6 38
           Q 4 28, 8 18
           Q 12 10, 19 9
           Q 26 7, 31 10
           Q 32 10 35 12"
        stroke="url(#brushStrokeO)"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        mask="url(#roughEdgeO)"
        className={styles.drawStrokeCircle}
        style={{
          strokeDasharray: 165,
          strokeDashoffset: 165,
        }}
      />
    </svg>
  );
}
