import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { MenuIcon } from '@/components/ui/menu';
import { XIcon } from '@/components/ui/x';
import { useAppContext } from '@/contexts/AppContext';
import { useTranslation } from '@/i18n';

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
        { name: t('nav.links.blog'), route: '/blog' },
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

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-dark-900"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={t('nav.toggleMenu')}
                    >
                        {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
                    </button>
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
                            <motion.button
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.36, duration: 0.5 }}
                                onClick={() => {
                                    openResume();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="mt-6 px-8 py-3 bg-dark-900 text-cream-50 rounded-full text-lg font-medium cursor-pointer"
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
