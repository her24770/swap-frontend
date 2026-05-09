import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();




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
};

export default withNextIntl(nextConfig);
