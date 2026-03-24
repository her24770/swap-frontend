export const metadata = {
  title: 'Mi App en Docker',
  description: 'Generado por Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}