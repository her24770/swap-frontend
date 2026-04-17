import { Jockey_One, Palanquin, Lato } from 'next/font/google';

export const jockey = Jockey_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--swap-font-titulos',
});

export const palanquin = Palanquin({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--swap-font-subtitulos',
})

export const lato = Lato({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--swap-font-textos',
});