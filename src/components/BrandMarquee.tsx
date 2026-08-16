import { useTranslation } from '@/i18n';
import { useTechShowcase } from '@/context/TechShowcaseContext';
import { techCatalog } from './Hero/techCatalog';

/**
 * The scroll is a CSS animation rather than a framer-motion one. A `'-50%'`
 * transform target is percentage-based, so Motion cannot hand it to the Web
 * Animations API and has to drive it from its JS frameloop instead — and with
 * `repeat: Infinity` that frameloop then re-schedules itself every frame for
 * as long as the page is open, which is what kept the document from ever
 * going idle. In CSS the same motion runs on the compositor, pauses on hover
 * without a re-render, and switches off under `prefers-reduced-motion`.
 */
const BrandMarquee = () => {
    const { t } = useTranslation();
    const { select } = useTechShowcase();

    return (
        <section className="py-20 overflow-hidden bg-transparent relative">
            <div className="max-w-[1440px] mx-auto px-6 md:px-20 mb-8">
                <div className="flex items-center gap-4">
                    <span className="text-eyebrow text-dark-900/45">{t('brandMarquee.eyebrow')}</span>
                    <span className="h-px flex-1 max-w-[120px] bg-dark-900/12" />
                </div>
            </div>

            <div className="flex w-full mask-image-gradient marquee-viewport">
                <div className="flex gap-16 items-center whitespace-nowrap pr-16 marquee-track">
                    {[...techCatalog, ...techCatalog].map((brand, index) => (
                        <button
                            key={`${brand.id}-${index}`}
                            type="button"
                            onClick={() => select(brand)}
                            className="group relative flex flex-col items-center justify-center min-w-[56px] cursor-pointer bg-transparent border-0 p-0 focus-visible:outline-2 focus-visible:outline-coral-500 focus-visible:outline-offset-4 rounded"
                            aria-label={t('brandMarquee.logoAlt', { name: brand.name })}
                        >
                            {brand.marqueeUrl ? (
                                <img
                                    src={brand.marqueeUrl}
                                    alt={brand.name}
                                    crossOrigin="anonymous"
                                    className="h-12 w-auto object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                    loading="lazy"
                                />
                            ) : (
                                <span
                                    aria-hidden="true"
                                    className="flex h-12 items-center font-mono text-lg tracking-tight text-dark-900/45 opacity-70 group-hover:text-dark-900/85 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                >
                                    {brand.name}
                                </span>
                            )}
                            {/*
                              * The hover label names the logo above it. A wordmark
                              * entry already *is* its name, so showing the label too
                              * would print it twice.
                              */}
                            {brand.marqueeUrl && (
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-widest uppercase text-dark-900/0 group-hover:text-dark-900/65 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                                    {brand.name}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <style>{`
                .mask-image-gradient {
                    mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
                }

                /* The track holds the catalog twice, so -50% lands exactly on the
                   start of the second copy and the loop is seamless. */
                @keyframes brand-marquee {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }

                .marquee-track {
                    animation: brand-marquee 50s linear infinite;
                    will-change: transform;
                }

                .marquee-viewport:hover .marquee-track {
                    animation-play-state: paused;
                }

                @media (prefers-reduced-motion: reduce) {
                    .marquee-track {
                        animation: none;
                        will-change: auto;
                    }
                }
            `}</style>
        </section>
    );
};

export default BrandMarquee;
