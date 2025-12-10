/**
 * SVG иконка копирования
 */
interface CopyIconProps {
  className?: string;
}

export default function CopyIcon({ className }: CopyIconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M13.3333 13.3333H16.6667C17.5871 13.3333 18.3333 12.5871 18.3333 11.6667V4.99996C18.3333 4.07949 17.5871 3.33329 16.6667 3.33329H10C9.07953 3.33329 8.33333 4.07949 8.33333 4.99996V6.0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="3.33333"
        y="6.66663"
        width="10"
        height="10"
        rx="1.66667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
