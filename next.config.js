import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */

const nextConfig = {
    output: 'standalone',
    poweredByHeader: false,
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'i.pravatar.cc' },
            { protocol: 'http', hostname: 'localhost', port: '3001' },
            { protocol: 'https', hostname: '*.r2.dev' },
        ],
    },
    // Fix BG-19: cabeceras HTTP defensivas — no estaban configuradas en
    // ningún lado (ni Express con Helmet, ni Next). Se aplican a todas las
    // rutas de la app.
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
                    // CSP en proxy.ts para generar nonce en cada request
                ],
            },
        ];
    },
};

export default withNextIntl(nextConfig);