import { createHmac } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';

const claveCodificada = process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY;
const clave = Buffer.from(claveCodificada || '', 'base64');

if (![16, 24, 32].includes(clave.length)) {
    throw new Error('NEXT_SERVER_ACTIONS_ENCRYPTION_KEY debe codificar 16, 24 o 32 bytes en base64');
}

const derivar = (etiqueta) => createHmac('sha256', clave).update(etiqueta).digest('hex');
const preview = {
    previewModeId: derivar('preview-id').slice(0, 32),
    previewModeSigningKey: derivar('preview-signing'),
    previewModeEncryptionKey: derivar('preview-encryption'),
    expireAt: 8640000000000000,
};

mkdirSync('.next/cache', { recursive: true });
writeFileSync('.next/cache/.previewinfo', JSON.stringify(preview));
