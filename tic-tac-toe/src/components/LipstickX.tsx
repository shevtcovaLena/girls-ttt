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
        {/* Радиальный градиент для объёма */}
        <radialGradient id="brushStroke1">
          <stop offset="0%" stopColor="#ffc4d6" />
          <stop offset="40%" stopColor="#f5a8bd" />
          <stop offset="70%" stopColor="#e89cae" />
          <stop offset="100%" stopColor="#d17a93" />
        </radialGradient>
        
        <radialGradient id="brushStroke2">
          <stop offset="0%" stopColor="#ffb8cd" />
          <stop offset="40%" stopColor="#f096ad" />
          <stop offset="70%" stopColor="#dc7f97" />
          <stop offset="100%" stopColor="#ca6e87" />
        </radialGradient>
      </defs>
      
      {/* Тонкая тень */}
      <path
        d="M 10 20 
           Q 18 12 26 20
           L 50 44
           Q 54 48 50 54
           Q 44 50 38 44
           L 18 24
           Q 12 18 10 20 Z"
        fill="rgba(150, 80, 100, 0.25)"
        className="blur-[1px]"
        transform="translate(1, 1)"
      />
      
      <path
        d="M 50 20
           Q 54 12 60 18
           Q 54 24 50 28
           L 24 54
           Q 18 60 12 54
           Q 18 48 24 42
           L 44 22
           Q 48 18 50 20 Z"
        fill="rgba(150, 80, 100, 0.25)"
        className="blur-[1px]"
        transform="translate(1, 1)"
      />
      
      {/* Первый мазок */}
      <path
        d="M 10 20 
           Q 18 12 26 20
           L 50 44
           Q 54 48 50 54
           Q 44 50 38 44
           L 18 24
           Q 12 18 10 20 Z"
        fill="url(#brushStroke1)"
        className={styles.drawStroke}
      />
      
      {/* Второй мазок */}
      <path
        d="M 50 20
           Q 54 12 60 18
           Q 54 24 50 28
           L 24 54
           Q 18 60 12 54
           Q 18 48 24 42
           L 44 22
           Q 48 18 50 20 Z"
        fill="url(#brushStroke2)"
        className={styles.drawStrokeDelayed}
      />
    </svg>
  );
}
