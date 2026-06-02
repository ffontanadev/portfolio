import { useId } from 'react';

export interface FlagProps {
  size?: number;
  className?: string;
}

/** Circular flag frame — clips children to a circle via a unique clip-path. */
const FlagBase = ({
  size = 20,
  className,
  children,
}: FlagProps & { children: React.ReactNode }) => {
  const clipId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="12" cy="12" r="12" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>{children}</g>
      <circle cx="12" cy="12" r="11.5" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
    </svg>
  );
};

// Simplified, icon-scale flags. Recognizable rather than heraldically exact.

export const FlagEN = (props: FlagProps) => (
  <FlagBase {...props}>
    <rect width="24" height="24" fill="#012169" />
    <path d="M0,0 L24,24 M24,0 L0,24" stroke="#FFFFFF" strokeWidth="5" />
    <path d="M0,0 L24,24 M24,0 L0,24" stroke="#C8102E" strokeWidth="2.5" />
    <path d="M12,0 V24 M0,12 H24" stroke="#FFFFFF" strokeWidth="7" />
    <path d="M12,0 V24 M0,12 H24" stroke="#C8102E" strokeWidth="4" />
  </FlagBase>
);

export const FlagES = (props: FlagProps) => (
  <FlagBase {...props}>
    <rect width="24" height="24" fill="#AA151B" />
    <rect y="6" width="24" height="12" fill="#F1BF00" />
  </FlagBase>
);

export const FlagPT = (props: FlagProps) => (
  <FlagBase {...props}>
    <rect width="24" height="24" fill="#DA291C" />
    <rect width="9.6" height="24" fill="#046A38" />
    <circle cx="9.6" cy="12" r="3.2" fill="#FFE000" stroke="#DA291C" strokeWidth="0.8" />
    <circle cx="9.6" cy="12" r="1.3" fill="#DA291C" />
  </FlagBase>
);

// Unit 5-point star (outer radius 1, pointing up), reused via transforms.
const STAR =
  'M0,-1 L0.2245,-0.309 L0.951,-0.309 L0.363,0.118 L0.588,0.809 L0,0.382 L-0.588,0.809 L-0.363,0.118 L-0.951,-0.309 L-0.2245,-0.309 Z';

export const FlagZH = (props: FlagProps) => (
  <FlagBase {...props}>
    <rect width="24" height="24" fill="#DE2910" />
    <g fill="#FFDE00">
      <path d={STAR} transform="translate(6.5 7.5) scale(4)" />
      <path d={STAR} transform="translate(13 3.2) scale(1.4)" />
      <path d={STAR} transform="translate(15.6 5.8) scale(1.4)" />
      <path d={STAR} transform="translate(15.8 9.4) scale(1.4)" />
      <path d={STAR} transform="translate(13.2 12) scale(1.4)" />
    </g>
  </FlagBase>
);
