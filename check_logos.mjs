import https from 'https';

const brands = [
  'supabase', 'nextjs', 'aws', 'threejs', 'drizzle', 'sqlite', 'mongodb', 
  'postgresql', 'spring', 'sequelize', 'express', 'tailwindcss', 
  'astro', 'bootstrap', 'vercel', 'godaddy', 'google_cloud', 
  'csharp', 'lit', 'redux', 'auth0', 'json_web_token', 'react', 'vitejs'
];

// Alternate names to try if the first one fails
const alternates = {
    'nextjs': ['nextjs_icon_dark', 'nextjs_icon_light'],
    'aws': ['amazon-web-services'],
    'spring': ['spring-boot'],
    'express': ['expressjs'],
    'google_cloud': ['google-cloud', 'gcp'],
    'csharp': ['c-sharp'],
    'json_web_token': ['jwt'],
    'vitejs': ['vite']
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
    console.log('Checking URLs...');
    for (const brand of brands) {
        let result = await checkUrl(brand);
        if (result.status !== 200 && alternates[brand]) {
            for (const alt of alternates[brand]) {
                const altResult = await checkUrl(alt);
                if (altResult.status === 200) {
                    result = altResult;
                    break;
                }
            }
        }
        
        if (result.status === 200) {
             console.log(`[OK] ${brand}: ${result.url}`);
        } else {
             console.log(`[FAIL] ${brand}`);
        }
    }
})();
