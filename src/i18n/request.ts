import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({requestLocale}) => {

    let locale = await requestLocale;

    if (!locale) locale = 'es';

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
        
    };
});