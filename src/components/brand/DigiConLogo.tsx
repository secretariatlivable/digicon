type DigiConLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
};

const sizeMap = {
  sm: { img: 'w-8 h-8', text: 'text-base' },
  md: { img: 'w-10 h-10', text: 'text-xl' },
  lg: { img: 'w-14 h-14', text: 'text-2xl' },
  xl: { img: 'w-20 h-20', text: 'text-3xl' },
};

export function DigiConLogo({ size = 'md', showText = true, className = '' }: DigiConLogoProps) {
  const s = sizeMap[size];
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src="/DigiCon_logo_transparent.jpg"
        alt="DigiCon logo"
        className={`${s.img} rounded-full object-cover ring-1 ring-white/10`}
      />
      {showText && <span className={`${s.text} font-bold text-white tracking-tight`}>DigiCon</span>}
    </span>
  );
}
