import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n';

const ArtGallery = () => {
    const { t } = useTranslation();
    // Placeholder images using colored divs for now
    const artPieces = [
        { height: 'h-64', color: 'bg-red-100' },
        { height: 'h-96', color: 'bg-blue-100' },
        { height: 'h-72', color: 'bg-green-100' },
        { height: 'h-80', color: 'bg-yellow-100' },
        { height: 'h-64', color: 'bg-purple-100' },
        { height: 'h-96', color: 'bg-pink-100' },
        { height: 'h-72', color: 'bg-indigo-100' },
        { height: 'h-80', color: 'bg-teal-100' },
    ];

    return (
        <section id="about" className="py-32 px-6 md:px-20 max-w-[1440px] mx-auto">
            <div className="mb-16">
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
                    {t('artGallery.heading')}
                </h2>
                <p className="text-xl text-gray-600">
                    {t('artGallery.subheading')}
                </p>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {artPieces.map((piece, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className={`w-full ${piece.height} ${piece.color} rounded-2xl break-inside-avoid hover:opacity-90 transition-opacity cursor-pointer`}
                    />
                ))}
            </div>

            <div className="mt-20 text-center">
                <p className="text-2xl font-display font-bold mb-8">
                    {t('artGallery.digitalArt')}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-xl" />
                    ))}
                </div>
            </div>

            <div className="mt-20 text-center bg-cream-100 rounded-3xl p-12">
                <h3 className="text-2xl font-bold mb-4">
                    {t('artGallery.commissions')}
                </h3>
                <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-coral-500 font-bold hover:underline"
                >
                    {t('artGallery.reachOut')}
                </a>
            </div>
        </section>
    );
};

export default ArtGallery;
