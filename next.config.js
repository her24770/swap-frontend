import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || apiUrl;

/** @type {import('next').NextConfig} */

const nextConfig = {
    output: 'standalone',
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
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            // Next.js necesita 'unsafe-inline' para los estilos que inyecta;
                            // 'unsafe-eval' solo aplica en dev (hot reload / react-refresh).
                            `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ''}`,
                            "style-src 'self' 'unsafe-inline'",
                            `img-src 'self' data: https: blob:`,
                            `connect-src 'self' ${apiUrl} ${socketUrl} wss: https:`,
                            "frame-ancestors 'none'",
                            "base-uri 'self'",
                            "form-action 'self'",
                        ].join('; '),
                    },
                ],
            },
        ];
    },
};

export default withNextIntl(nextConfig);