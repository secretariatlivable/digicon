import { type ReactNode, type ButtonHTMLAttributes } from 'react';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  variant?: 'ultraThin' | 'thin' | 'regular' | 'thick' | 'chrome';
  hover?: boolean;
  onClick?: () => void;
};

const variantClasses = {
  ultraThin: 'glass-ultra-thin',
  thin: 'glass-thin',
  regular: 'glass-regular',
  thick: 'glass-thick',
  chrome: 'glass-chrome',
};

export function GlassCard({ children, className = '', variant = 'regular', hover = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`${variantClasses[variant]} ${hover ? 'glass-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

type GlassButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: GlassButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: 'glass-button-primary',
    secondary: 'glass-button-secondary',
    ghost: 'glass-button-ghost',
    danger: 'glass-button-danger',
  };

  return (
    <button
      className={`glass-button ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function GlassInput({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`glass-input ${className}`} {...props} />;
}

export function GlassSelect({ className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`glass-input ${className}`} {...props} />;
}

export function GlassTextarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`glass-input ${className}`} {...props} />;
}

export function GlassLabel({ children, className = '', ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`block text-sm font-medium text-white/70 mb-2 ${className}`} {...props}>
      {children}
    </label>
  );
}

export function Badge({ children, color = 'blue', className = '' }: { children: ReactNode; color?: string; className?: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-digicon-primary/20 text-digicon-primary border-digicon-primary/30',
    green: 'bg-digicon-eco/20 text-digicon-eco border-digicon-eco/30',
    orange: 'bg-digicon-warning/20 text-digicon-warning border-digicon-warning/30',
    red: 'bg-digicon-error/20 text-digicon-error border-digicon-error/30',
    purple: 'bg-digicon-secondary/20 text-digicon-secondary border-digicon-secondary/30',
    gray: 'bg-white/10 text-white/60 border-white/20',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${colorMap[color] || colorMap.blue} ${className}`}>
      {children}
    </span>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin ${className}`} />
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-glass-xl glass-thin flex items-center justify-center mb-4 text-white/40">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white/90 mb-2">{title}</h3>
      <p className="text-white/50 max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
}
