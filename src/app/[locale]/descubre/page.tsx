import { useTranslations } from 'next-intl';

export default function DescubrePage() {
  const t = useTranslations('descubre');

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{t('placeholderTitle')}</h1>
      <p>{t('placeholderDescription')}</p>
    </main>
  );
}
