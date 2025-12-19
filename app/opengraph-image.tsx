import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'Polaroida - Visual Journal'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          letterSpacing: '-0.05em',
        }}
      >
        <div style={{ color: '#C2252B', fontWeight: 900 }}>Polaroida</div>
        <div style={{ fontSize: 32, color: '#555', marginTop: 24 }}>Minimalist Visual Journal</div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image size config
      ...size,
    }
  )
}
