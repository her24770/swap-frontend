import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import Layout from '../../components/layout/Layout/layout';
import ToastContainer from '../../components/ui/Toast/Toast';
import { jockey, palanquin, lato } from '../../styles/fonts';
import './globals.css';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale: params.locale, namespace: 'layout.meta' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html
      lang={params.locale}
      className={`${jockey.variable} ${palanquin.variable} ${lato.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <Layout>{children}</Layout>
          <ToastContainer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}