import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'radial-gradient(circle at top left, #2dd4bf 0%, #111827 42%), radial-gradient(circle at bottom right, #0f766e 0%, #020617 56%)',
          color: '#f8fafc',
          padding: '72px',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            borderRadius: '999px',
            border: '1px solid rgba(248, 250, 252, 0.24)',
            padding: '10px 16px',
            fontSize: 24,
            letterSpacing: 1,
          }}
        >
          Deepo
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 74, fontWeight: 700, lineHeight: 1.1 }}>Mini Tools Suite</div>
          <div style={{ fontSize: 32, opacity: 0.86 }}>
            Developer, design, and operations tools in one fast workspace.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
