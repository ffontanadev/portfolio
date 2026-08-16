import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Terminal, Github } from 'lucide-react';
import { MenuIcon } from '@/components/ui/menu';
import { XIcon } from '@/components/ui/x';
import { useAppContext } from '@/contexts/AppContext';
import { useTranslation } from '@/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Navigation = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { openResume } = useAppContext();
    const { t } = useTranslation();

    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: t('nav.links.home'), href: '#hero', route: '/' },
        { name: t('nav.links.work'), href: '#work' },
        { name: t('nav.links.about'), href: '#about' },
        { name: t('nav.links.connect'), href: '#connect' },
    ];

    return (
        <>
            {/* Scroll progress hairline */}
            <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />

            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'glass-nav py-3' : 'bg-transparent py-6'
                    }`}
            >
                <div className="max-w-[1440px] mx-auto px-6 md:px-20 flex justify-between items-center">
                    {/* Logo */}
                    <motion.a
                        href="/"
                        className="group flex items-baseline gap-1 select-none"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <span className="text-2xl font-display font-bold tracking-tighter group-hover:text-coral-500 transition-colors duration-500">
                            FF
                        </span>
                        <span className="text-2xl font-display italic font-light text-coral-500/80">.</span>
                    </motion.a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link, idx) => (
                            <div key={link.name} className="flex items-baseline gap-2">
                                <span className="font-mono text-[10px] tracking-widest text-dark-900/35">
                                    0{idx + 1}
                                </span>
                                {link.route ? (
                                    <Link
                                        to={link.route}
                                        className="reveal-underline text-sm font-medium text-dark-900 hover:text-coral-500 transition-colors duration-500"
                                    >
                                        {link.name}
                                    </Link>
                                ) : (
                                    <a
                                        href={link.href}
                                        className="reveal-underline text-sm font-medium text-dark-900 hover:text-coral-500 transition-colors duration-500"
                                    >
                                        {link.name}
                                    </a>
                                )}
                            </div>
                        ))}
                        {/*
                          * Spec §4.2 Option B — both accounts, side by side. The
                          * second renders as a mono wordmark rather than a second
                          * identical octocat: two of the same glyph reads as a
                          * rendering bug, and telling them apart is the point.
                          */}
                        <div className="flex items-center gap-3">
                            <a
                                href="https://github.com/ffontanadev"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t('nav.githubPrimary')}
                                title={t('nav.githubPrimary')}
                                className="text-dark-900/70 transition-colors duration-300 hover:text-coral-500"
                            >
                                <Github size={18} />
                            </a>
                            <a
                                href="https://github.com/elFonTii"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t('nav.githubEngine')}
                                title={t('nav.githubEngine')}
                                className="font-mono text-[11px] tracking-tight text-dark-900/55 transition-colors duration-300 hover:text-coral-500"
                            >
                                elFonTii
                            </a>
                        </div>
                        <LanguageSwitcher />
                        <Link
                            to="/dev-zone"
                            data-tour-id="dev-zone"
                            className="group flex items-center gap-2 rounded-full border border-dark-900/15 px-4 py-2.5 text-sm font-medium text-dark-900 transition-colors duration-300 hover:border-coral-500 hover:text-coral-500"
                        >
                            <Terminal size={15} />
                            {t('nav.devZone')}
                        </Link>
                        <button
                            onClick={openResume}
                            className="group relative overflow-hidden px-6 py-2.5 rounded-full font-medium text-sm bg-dark-900 text-cream-50 cursor-pointer"
                        >
                            <span className="relative z-10 transition-colors duration-500 group-hover:text-cream-50">
                                {t('nav.resume')}
                            </span>
                            <span className="absolute inset-0 bg-coral-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                        </button>
                    </div>

                    {/* Mobile controls */}
                    <div className="md:hidden flex items-center gap-2">
                        <LanguageSwitcher />
                        <button
                            className="p-2 text-dark-900"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={t('nav.toggleMenu')}
                        >
                            {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-40 bg-cream-50/95 backdrop-blur-xl pt-28 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-8 items-center">
                            {navLinks.map((link, idx) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.06 * idx, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    className="flex items-baseline gap-3"
                                >
                                    <span className="font-mono text-xs text-dark-900/30">0{idx + 1}</span>
                                    {link.route ? (
                                        <Link
                                            to={link.route}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="text-3xl font-display font-bold text-dark-900 hover:text-coral-500 transition-colors"
                                        >
                                            {link.name}
                                        </Link>
                                    ) : (
                                        <a
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="text-3xl font-display font-bold text-dark-900 hover:text-coral-500 transition-colors"
                                        >
                                            {link.name}
                                        </a>
                                    )}
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.26, duration: 0.5 }}
                                className="flex items-center gap-6"
                            >
                                <a
                                    href="https://github.com/ffontanadev"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={t('nav.githubPrimary')}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-2 font-mono text-sm text-dark-900/70"
                                >
                                    <Github size={18} />
                                    ffontanadev
                                </a>
                                <a
                                    href="https://github.com/elFonTii"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={t('nav.githubEngine')}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-2 font-mono text-sm text-dark-900/70"
                                >
                                    <Github size={18} />
                                    elFonTii
                                </a>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                <Link
                                    to="/dev-zone"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="mt-6 flex items-center gap-2 rounded-full border border-dark-900/15 px-8 py-3 text-lg font-medium text-dark-900"
                                >
                                    <Terminal size={18} />
                                    {t('nav.devZone')}
                                </Link>
                            </motion.div>
                            <motion.button
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.36, duration: 0.5 }}
                                onClick={() => {
                                    openResume();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="mt-2 px-8 py-3 bg-dark-900 text-cream-50 rounded-full text-lg font-medium cursor-pointer"
                            >
                                {t('nav.viewResume')}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navigation;
