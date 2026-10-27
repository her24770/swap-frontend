import { headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import Layout from '../../components/layout/Layout/layout';
import ToastContainer from '../../components/ui/Toast/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog/ConfirmDialog';
import { ThemeProvider } from '../../context/Themecontext'
import { GuardadosProvider } from '../../context/GuardadosContext';
import { jockey, palanquin, lato } from '../../styles/fonts';
import './globals.css';

// Aplica el tema guardado o preferencia del sistema antes del primer pintado,
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}var e=document.documentElement;e.setAttribute('data-theme',t);e.setAttribute('theme',t)}catch(e){}})()`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'layout.meta' });
  return {
    title: t('title'),
    description: t('description'),
    icons: {
      icon: '/favicon.svg',
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const nonce = (await headers()).get('x-nonce');
  return (
    <html
      lang={locale}
      className={`${jockey.variable} ${palanquin.variable} ${lato.variable}`}
      data-csp-nonce={nonce ?? undefined}
      suppressHydrationWarning
    >
      <head>
        <script nonce={nonce ?? undefined} dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <GuardadosProvider>
              <Layout>{children}</Layout>
            </GuardadosProvider>
            <ToastContainer />
            <ConfirmDialog />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
