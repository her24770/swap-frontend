import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['es', 'en', 'fr'],
    defaultLocale: 'es',
    localePrefix: 'always' 
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);