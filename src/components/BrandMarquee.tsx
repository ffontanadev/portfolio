import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';

const brands = [
    { name: 'Supabase', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/supabase.svg' },
    { name: 'Next.js', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/nextjs_icon_dark.svg' },
    { name: 'AWS', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/aws_light.svg' },
    { name: 'Three.js', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/threejs-light.svg' },
    { name: 'Drizzle', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/drizzle-orm_light.svg' },
    { name: 'SQLite', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/sqlite.svg' },
    { name: 'MongoDB', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/mongodb-icon-light.svg' },
    { name: 'PostgreSQL', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/postgresql.svg' },
    { name: 'Spring Boot', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/spring.svg' },
    { name: 'Sequelize', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/sequelize.svg' },
    { name: 'Express.js', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/expressjs.svg' },
    { name: 'Tailwind CSS', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/tailwindcss.svg' },
    { name: 'Astro', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/astro-icon-light.svg' },
    { name: 'Bootstrap', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/bootstrap.svg' },
    { name: 'Vercel', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/vercel.svg' },
    { name: 'GoDaddy', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/godaddy.svg' },
    { name: 'Google Cloud', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/google-cloud.svg' },
    { name: 'C#', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/csharp.svg' },
    { name: 'Lit', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/lit.svg' },
    { name: 'Redux', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/redux.svg' },
    { name: 'Auth0', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/auth0.svg' },
    { name: 'JWT', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/jwt.svg' },
    { name: 'Vite', url: 'https://raw.githubusercontent.com/pheralb/svgl/main/static/library/vitejs.svg' },
];

const BrandMarquee = () => {
    const [paused, setPaused] = useState(false);
    const { t } = useTranslation();

    return (
        <section className="py-20 overflow-hidden bg-transparent relative">
            <div className="max-w-[1440px] mx-auto px-6 md:px-20 mb-8">
                <div className="flex items-center gap-4">
                    <span className="text-eyebrow text-dark-900/45">{t('brandMarquee.eyebrow')}</span>
                    <span className="h-px flex-1 max-w-[120px] bg-dark-900/12" />
                </div>
            </div>

            <div
                className="flex w-full mask-image-gradient"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                <motion.div
                    className="flex gap-16 items-center whitespace-nowrap pr-16"
                    animate={{ x: paused ? undefined : '-50%' }}
                    transition={{
                        repeat: Infinity,
                        duration: 50,
                        ease: 'linear',
                    }}
                >
                    {[...brands, ...brands].map((brand, index) => (
                        <div
                            key={`${brand.name}-${index}`}
                            className="group relative flex flex-col items-center justify-center min-w-[56px]"
                        >
                            <img
                                src={brand.url}
                                alt={brand.name}
                                className="h-12 w-auto object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                loading="lazy"
                                aria-label={t('brandMarquee.logoAlt', { name: brand.name })}
                            />
                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-widest uppercase text-dark-900/0 group-hover:text-dark-900/65 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                                {brand.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>

            <style>{`
                .mask-image-gradient {
                    mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
                }
            `}</style>
        </section>
    );
};

export default BrandMarquee;
