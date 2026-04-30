import Layout from "../components/layout/Layout/layout"
import ToastContainer from "../components/ui/Toast/Toast"
import "./globals.css"
import { jockey, palanquin, lato} from "../styles/fonts";

export const metadata = {
  title: 'Swap',
  description: 'Sitio de intercambio enttre estudiantes de la UVG',
}

export default function RootLayout(
  {children,}: 
  {children: React.ReactNode}) {
  return (
    <html lang="es" className={`${jockey.variable} ${palanquin.variable} ${lato.variable}`}>
      <body>
        <Layout>{children}</Layout>
        <ToastContainer />
      </body>
    </html>
  )
}