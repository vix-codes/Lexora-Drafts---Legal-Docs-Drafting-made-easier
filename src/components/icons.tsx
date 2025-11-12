import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 16.5l-4-4-4 4" />
      <path d="M12 3v9" />
      <path d="M12 21a9 9 0 0 0 0-18 9 9 0 0 0 0 18Z" />
      <path d="M7 21a9 9 0 0 0 10 0" />
    </svg>
  );
}
