interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, onClick, className = "" }: CardProps) {
  return (
    <div
      className={`bg-surface-200 dark:bg-surface-700 rounded-xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
