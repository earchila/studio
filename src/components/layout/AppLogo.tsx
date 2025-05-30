import type { SVGProps } from 'react';

export function AppLogo({
  iconOnly = false,
  ...props
}: SVGProps<SVGSVGElement> & { iconOnly?: boolean }) {
  if (iconOnly) {
    return (
      <svg
        viewBox="0 0 53 53"
        aria-label="Cymbal Shops Icon"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <rect x="0" y="0" width="25" height="25" rx="5" fill="#D83A56" />
        <rect x="0" y="28" width="25" height="25" rx="5" fill="#F47B20" />
        <rect x="28" y="28" width="25" height="25" rx="5" fill="#7A2850" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 200 60"
      aria-label="Cymbal Shops Logo"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Icon part */}
      <rect x="0" y="5" width="25" height="25" rx="5" fill="#D83A56" />
      <rect x="0" y="33" width="25" height="25" rx="5" fill="#F47B20" />
      <rect x="28" y="33" width="25" height="25" rx="5" fill="#7A2850" />
      {/* Text part */}
      <text
        x="60"
        y="28"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="22"
        fontWeight="bold"
        fill="currentColor"
      >
        Cymbal
      </text>
      <text
        x="60"
        y="52"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="22"
        fontWeight="bold"
        fill="currentColor"
      >
        Shops
      </text>
    </svg>
  );
}
