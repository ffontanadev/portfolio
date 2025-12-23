import https from 'https';

const retryBrands = {
    'aws': ['aws_dark', 'aws_light', 'amazon-web-services_dark', 'amazon'],
    'threejs': ['threejs_dark', 'threejs_light', 'three'],
    'drizzle': ['drizzle_dark', 'drizzle_light', 'drizzle-orm'],
    'mongodb': ['mongodb_icon', 'mongo', 'mongo_db'],
    'astro': ['astro_dark', 'astro_light'],
    'react': ['react_dark', 'react_light', 'reactjs']
};

const baseUrl = 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/';

async function checkUrl(name) {
    return new Promise(resolve => {
        const url = `${baseUrl}${name}.svg`;
        https.get(url, (res) => {
            resolve({ name, url, status: res.statusCode });
        }).on('error', () => resolve({ name, url, status: 500 }));
    });
}

(async () => {
    console.log('Retrying URLs...');
    for (const [key, variants] of Object.entries(retryBrands)) {
        let found = false;
        for (const variant of variants) {
            const result = await checkUrl(variant);
            if (result.status === 200) {
                console.log(`[OK] ${key}: ${result.url}`);
                found = true;
                break;
            }
        }
        if (!found) {
            console.log(`[FAIL] ${key}`);
        }
    }
})();
