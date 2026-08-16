import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation, LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from '@/i18n';
import { buildLocalePath, parseLocalePath } from '@/i18n/routing';
import { FlagEN, FlagES, FlagPT, FlagZH, type FlagProps } from '@/components/ui/flags';

const FLAGS: Record<Locale, ComponentType<FlagProps>> = {
  en: FlagEN,
  es: FlagES,
  pt: FlagPT,
  zh: FlagZH,
};

interface LanguageSwitcherProps {
  /** `compact` (default) for the top bar; `full` shows the label inline (mobile menu). */
  variant?: 'compact' | 'full';
}

const LanguageSwitcher = ({ variant = 'compact' }: LanguageSwitcherProps) => {
  const { locale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  // §8: switching language on a deep path stays on that path.
  const { rest } = parseLocalePath(pathname);

  const ActiveFlag = FLAGS[locale];

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('language.select')}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`group flex items-center gap-2 rounded-full border border-dark-900/10 bg-cream-50/70 backdrop-blur-sm transition-all duration-300 hover:border-coral-500/40 cursor-pointer ${
          variant === 'full' ? 'px-4 py-2.5' : 'px-2.5 py-1.5'
        }`}
      >
        <ActiveFlag size={variant === 'full' ? 22 : 18} />
        <span
          className={`font-mono uppercase tracking-widest text-dark-900/70 group-hover:text-coral-500 transition-colors ${
            variant === 'full' ? 'text-sm' : 'text-[10px]'
          }`}
        >
          {variant === 'full' ? LOCALE_LABELS[locale] : locale}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute right-0 z-50 mt-2 min-w-[10rem] overflow-hidden rounded-2xl border border-dark-900/10 bg-cream-50/95 backdrop-blur-xl shadow-[0_20px_40px_-20px_rgba(26,26,26,0.35)] ${
              variant === 'full' ? 'bottom-full mb-2 mt-0' : ''
            }`}
          >
            {SUPPORTED_LOCALES.map((code) => {
              const Flag = FLAGS[code];
              const isActive = code === locale;
              return (
                <li key={code} role="option" aria-selected={isActive}>
                  <Link
                    to={buildLocalePath(code, rest)}
                    hrefLang={code}
                    onClick={() => setOpen(false)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-coral-500/10 text-coral-500'
                        : 'text-dark-900/75 hover:bg-dark-900/[0.04] hover:text-dark-900'
                    }`}
                  >
                    <Flag size={20} />
                    <span className="font-medium">{LOCALE_LABELS[code]}</span>
                  </Link>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
