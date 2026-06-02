import { useTranslation } from '@/i18n';

const Playlists = () => {
    const { t } = useTranslation();
    return (
        <section className="py-20 px-6 md:px-20 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="max-w-[1440px] mx-auto text-center">
                <h2 className="text-3xl font-display font-bold mb-12">
                    {t('playlists.heading')}
                </h2>

                <div className="flex flex-col md:flex-row justify-center gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-full md:w-[350px] h-[80px] bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400">
                            {/* This would be an iframe in production */}
                            <span>{t('playlists.placeholder', { index: i })}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Playlists;
