import { motion } from 'framer-motion';
import { LinkedinIcon } from '@/components/ui/linkedin';
import { DownloadIcon } from '@/components/ui/download';
import { useAppContext } from '@/contexts/AppContext';
import { useTranslation } from '@/i18n';

const ease = [0.22, 1, 0.36, 1] as const;

const Contact = () => {
    const { openResume } = useAppContext();
    const { t, messages } = useTranslation();
    const email = 'contacto@ffontana.dev';
    const headline = t('contact.headline');

    return (
        <section
            id="connect"
            className="relative py-32 md:py-40 px-6 md:px-20 bg-cream-100 overflow-hidden"
        >
            {/* Drifting atmosphere */}
            <div
                aria-hidden="true"
                className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
            >
                <div className="absolute top-10 left-10 w-48 h-48 bg-coral-500/12 rounded-full blur-3xl animate-[drift_22s_ease-in-out_infinite]" />
                <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/12 rounded-full blur-3xl animate-[drift_28s_ease-in-out_infinite_reverse]" />
                <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-purple-500/8 rounded-full blur-3xl animate-[drift_24s_ease-in-out_infinite]" />
            </div>

            <div className="max-w-2xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease }}
                    className="flex items-center justify-center gap-4 mb-10"
                >
                    <span className="h-px w-12 bg-dark-900/20" />
                    <span className="text-eyebrow text-dark-900/55">{t('contact.eyebrow')}</span>
                    <span className="h-px w-12 bg-dark-900/20" />
                </motion.div>

                <p className="font-display italic text-dark-900/45 mb-6 font-light">
                    {t('contact.intro')}
                </p>

                {/* Kinetic headline */}
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="font-display font-display-xl font-bold text-5xl md:text-7xl tracking-[-0.02em] leading-[1.02] mb-14"
                >
                    {headline.split('').map((char, i) => (
                        <motion.span
                            key={i}
                            initial={{ y: 40, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.08 * i, duration: 0.7, ease }}
                            className={`wobble-letter ${char === '.' ? 'text-coral-500' : ''}`}
                        >
                            {char === ' ' ? ' ' : char}
                        </motion.span>
                    ))}
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease, delay: 0.3 }}
                    className="glass-card rounded-3xl p-7 md:p-9 mb-12 text-left overflow-hidden"
                >
                    {/* Header — B side, mirror of the Hero "A side" card */}
                    <header className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2.5">
                            <span
                                aria-hidden="true"
                                className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full border border-dark-900/35"
                            >
                                <span className="block h-[3px] w-[3px] rounded-full bg-dark-900/55" />
                            </span>
                            <span className="text-eyebrow text-coral-500">{t('contact.availableFor')}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="font-mono text-[9px] tracking-widest text-dark-900/40 uppercase">
                                {t('contact.side')}
                            </span>
                            <span
                                aria-hidden="true"
                                className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full border border-dark-900/35"
                            >
                                <span className="block h-[3px] w-[3px] rounded-full bg-dark-900/55" />
                            </span>
                        </div>
                    </header>

                    <ul className="divide-y divide-dark-900/8">
                        {messages.contact.services.map((service, i) => (
                            <motion.li
                                key={service.title}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.55 + i * 0.08, ease }}
                                className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 py-4 cursor-default"
                            >
                                <span className="font-mono text-[10px] tracking-widest text-dark-900/40 group-hover:text-coral-500 transition-colors duration-500 tabular-nums">
                                    {String(i + 1).padStart(2, '0')}
                                </span>

                                <span className="flex flex-col gap-1.5">
                                    <span className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
                                        <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-dark-900/40 border border-dark-900/15 rounded-full px-2 py-0.5 group-hover:text-coral-500 group-hover:border-coral-500/40 transition-all duration-500">
                                            {service.tag}
                                        </span>
                                        <span className="font-display text-base md:text-lg text-dark-900/85 font-medium tracking-tight group-hover:text-dark-900 transition-colors duration-500">
                                            {service.title}
                                        </span>
                                    </span>
                                    <span className="overflow-hidden grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
                                        <span className="min-h-0">
                                            <span className="block pt-1 text-sm text-dark-900/55 font-display italic font-light">
                                                {service.note}
                                            </span>
                                        </span>
                                    </span>
                                </span>

                                <span className="relative flex h-2 w-2" aria-hidden="true">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-60 animate-ping" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
                                </span>
                            </motion.li>
                        ))}
                    </ul>

                    {/* Footer — waveform + response time */}
                    <footer className="mt-6 pt-5 border-t border-dark-900/8 flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-[3px] h-3" aria-hidden="true">
                            {Array.from({ length: 32 }).map((_, i) => {
                                const h = 18 + Math.round(Math.sin(i * 0.7) * 8 + Math.cos(i * 0.3) * 6);
                                return (
                                    <span
                                        key={i}
                                        style={{ height: `${h}%` }}
                                        className="w-[2px] rounded-full bg-dark-900/25"
                                    />
                                );
                            })}
                        </div>
                        <span className="font-mono text-[9px] tracking-widest text-dark-900/55 uppercase whitespace-nowrap">
                            {t('contact.replyTime')}
                        </span>
                    </footer>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.7 }}
                    className="text-dark-900/55 font-display italic font-light max-w-lg mx-auto mb-12 leading-relaxed"
                >
                    {t('contact.closing')}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.8, ease }}
                    className="flex flex-col items-center gap-7"
                >
                    <button
                        onClick={openResume}
                        className="group relative inline-flex items-center gap-3 overflow-hidden bg-dark-900 text-cream-50 px-8 py-4 rounded-full font-medium cursor-pointer"
                    >
                        <DownloadIcon size={18} />
                        <span className="relative z-10">{t('contact.viewResume')}</span>
                        <span className="absolute inset-0 bg-coral-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                    </button>

                    <a
                        href={`mailto:${email}`}
                        className="group text-xl md:text-2xl font-display font-medium tracking-tight"
                    >
                        {email.split('').map((char, i) => (
                            <span
                                key={i}
                                className="wobble-letter"
                                style={{ transitionDelay: `${i * 12}ms` }}
                            >
                                {char === ' ' ? ' ' : char}
                            </span>
                        ))}
                    </a>

                    <div className="flex gap-3 mt-2">
                        <a
                            href="https://www.linkedin.com/in/felipefontana"
                            aria-label={t('contact.linkedin')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3.5 bg-cream-50/80 backdrop-blur-sm rounded-full border border-dark-900/8 text-dark-900/70 hover:text-coral-500 hover:border-coral-500/30 hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        >
                            <LinkedinIcon size={20} />
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Contact;
