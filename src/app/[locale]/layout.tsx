import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import Layout from '../../components/layout/Layout/layout';
import ToastContainer from '../../components/ui/Toast/Toast';
import { ThemeProvider } from '../../context/Themecontext'
import { jockey, palanquin, lato } from '../../styles/fonts';
import './globals.css';

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
  return (
    <html
      lang={locale}
      className={`${jockey.variable} ${palanquin.variable} ${lato.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <Layout>{children}</Layout>
            <ToastContainer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}