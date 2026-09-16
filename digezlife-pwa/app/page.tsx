export default function Page() {
  return (
    <main
      style={{
        colorScheme: 'light dark',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'light-dark(#fff, #0d1117)',
        color: 'light-dark(#000, #fff)',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          backgroundColor: '#0d6b68',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f5f7f7',
          fontWeight: 700,
          fontSize: 32,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        A
      </div>
      <h1
        style={{
          fontSize: '20px',
          fontWeight: 600,
          margin: 0,
        }}
      >
        Alamia PWA
      </h1>
      <p
        style={{
          fontSize: '14px',
          fontWeight: 400,
          color: 'light-dark(#71717a, #a1a1aa)',
          margin: 0,
        }}
      >
        Premium mobile-first Progressive Web App starter shell.
      </p>
    </main>
  )
}
