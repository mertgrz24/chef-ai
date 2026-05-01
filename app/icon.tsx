import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffa51f',
        borderRadius: '40px',
        fontSize: 108,
        lineHeight: 1,
      }}
    >
      🍳
    </div>,
    { width: 192, height: 192 }
  )
}
