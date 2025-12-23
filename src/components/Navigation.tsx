import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuIcon } from '@/components/ui/menu';
import { XIcon } from '@/components/ui/x';
import { useAppContext } from '@/contexts/AppContext';

const Navigation = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { openResume } = useAppContext();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    const navLinks = [
        { name: 'Home', href: '#hero' },
        { name: 'Work', href: '#work' },
        { name: 'About', href: '#about' },
        { name: 'Connect', href: '#connect' },
    ];

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-nav py-4' : 'bg-transparent py-6'
                    }`}
            >
                <div className="max-w-[1440px] mx-auto px-6 md:px-20 flex justify-between items-center">
                    {/* Logo */}
                    <a href="#" className="text-2xl font-display font-bold tracking-tighter hover:text-coral-500 transition-colors">
                        FF.
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-dark-900 font-medium hover:text-coral-500 transition-colors relative group"
                            >
                                {link.name}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-coral-500 transition-all group-hover:w-full" />
                            </a>
                        ))}
                        <button
                            onClick={openResume}
                            className="px-6 py-2 bg-dark-900 text-white rounded-full font-medium hover:bg-coral-500 transition-colors cursor-pointer"
                        >
                            Resume
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-dark-900"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-cream-50 pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-6 items-center">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-2xl font-display font-bold text-dark-900 hover:text-coral-500"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <button
                                onClick={() => {
                                    openResume();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="mt-4 px-8 py-3 bg-dark-900 text-white rounded-full text-lg font-medium cursor-pointer"
                            >
                                View Resume
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navigation;
