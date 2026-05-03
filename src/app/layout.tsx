import Layout from "../components/layout/Layout/layout"
import "./globals.css"
import { jockey, palanquin, lato} from "../styles/fonts";

export const metadata = {
  title: 'SWAP',
  description: 'Generado por Next.js',
  icons: {
    icon: "/favicon.svg",
  },
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