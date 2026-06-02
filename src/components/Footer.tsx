import { HeartIcon } from '@/components/ui/heart';
import { useTranslation } from '@/i18n';

const Footer = () => {
    const year = new Date().getFullYear();
    const { t } = useTranslation();

    const links = [
        { name: t('footer.links.home'), href: '#hero' },
        { name: t('footer.links.work'), href: '#work' },
        { name: t('footer.links.about'), href: '#about' },
        { name: t('footer.links.connect'), href: '#connect' },
        { name: t('footer.links.resume'), href: '/resume.pdf' },
    ];

    return (
        <footer className="relative bg-cream-50 pt-20 pb-12 px-6 md:px-20 border-t border-dark-900/8">
            <div className="max-w-[1440px] mx-auto">
                {/* Top row */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16">
                    <div>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-5xl md:text-6xl font-display font-bold tracking-tighter">FF</span>
                            <span className="text-5xl md:text-6xl font-display italic font-light text-coral-500">.</span>
                        </div>
                        <p className="font-display italic text-dark-900/55 max-w-xs leading-relaxed">
                            {t('footer.tagline')}
                        </p>
                    </div>

                    <nav className="flex flex-wrap gap-x-8 gap-y-3 md:justify-end">
                        {links.map((link, idx) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="reveal-underline text-sm font-medium text-dark-900/80 hover:text-coral-500 transition-colors duration-500 flex items-baseline gap-2"
                            >
                                <span className="font-mono text-[10px] text-dark-900/30">0{idx + 1}</span>
                                {link.name}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Hairline divider */}
                <div className="hairline text-dark-900 mb-6" />

                {/* Bottom row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-dark-900/45">
                        {t('footer.copyright', { year })}
                    </span>
                    <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-dark-900/45">
                        {t('footer.craftedWith')}
                        <HeartIcon size={12} className="fill-coral-500 text-coral-500" />
                        {t('footer.andReact')}
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
