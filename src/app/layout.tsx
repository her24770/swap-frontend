import Layout from "../components/layout/Layout/layout"
import "./globals.css"
import { jockey, palanquin, lato} from "../styles/fonts";

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
    <html lang="es" className={`${jockey.variable} ${palanquin.variable} ${lato.variable}`}>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}