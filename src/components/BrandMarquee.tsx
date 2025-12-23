import { motion } from 'framer-motion';

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
    return (
        <section className="py-16 overflow-hidden bg-transparent">
            <div className="flex w-full mask-image-gradient">
                <motion.div
                    className="flex gap-16 items-center whitespace-nowrap pr-16"
                    animate={{ x: "-50%" }}
                    transition={{
                        repeat: Infinity,
                        duration: 40,
                        ease: "linear"
                    }}
                >
                    {[...brands, ...brands].map((brand, index) => (
                        <div
                            key={`${brand.name}-${index}`}
                            className="group relative flex items-center justify-center min-w-[48px]"
                        >
                            <img
                                src={brand.url}
                                alt={brand.name}
                                className="h-12 w-auto object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 ease-in-out"
                                loading="lazy"
                                aria-label={`${brand.name} logo`}
                            />
                        </div>
                    ))}
                </motion.div>
            </div>
            <style>{`
                .mask-image-gradient {
                    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
            `}</style>
        </section>
    );
};

export default BrandMarquee;
