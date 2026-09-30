import type { SVGProps } from 'react';

export default function BrandLogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className="brand-logo-mark"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      {...props}
    >
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
