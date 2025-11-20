import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'hsl(261 44% 11%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(262 80% 70%)',
          borderRadius: '5px',
          filter: 'drop-shadow(0 0 3px hsl(262 80% 70%))',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v18" />
          <path d="M3 7h18" />
          <path d="M5 7a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0v-2a5 5 0 0 1 5-5Z" />
          <path d="M19 7a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0v-2a5 5 0 0 1 5-5Z" />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  )
}
