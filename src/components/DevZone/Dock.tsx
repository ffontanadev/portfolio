import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Music2, Plus, RotateCcw, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';
import type { WidgetType } from './types';
import { STATUS_SERVICES } from './data/statusServices';

interface DockProps {
  onAdd: (type: WidgetType, serviceId?: string) => void;
  onReset: () => void;
  /** Service ids already on the board, shown as active in the picker. */
  activeServiceIds: string[];
}

/**
 * Bottom dock: spawn music / pomodoro widgets, pick which status listeners to
 * surface, and reset the board to its default layout.
 */
export default function Dock({ onAdd, onReset, activeServiceIds }: DockProps) {
  const { t } = useTranslation();
  const [statusOpen, setStatusOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // Dismiss the status picker on outside click.
  useEffect(() => {
    if (!statusOpen) return;
    const handler = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [statusOpen]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div className="glass-card pointer-events-auto flex items-center gap-1 rounded-full px-2 py-2">
        <DockButton icon={<Music2 size={16} />} label={t('devZone.dock.music')} onClick={() => onAdd('music')} />
        <DockButton icon={<Timer size={16} />} label={t('devZone.dock.pomodoro')} onClick={() => onAdd('pomodoro')} />

        <div ref={pickerRef} className="relative">
          <DockButton
            icon={<Activity size={16} />}
            label={t('devZone.dock.status')}
            active={statusOpen}
            onClick={() => setStatusOpen((open) => !open)}
            trailing={<Plus size={12} className="opacity-60" />}
          />
          <AnimatePresence>
            {statusOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="glass-card absolute bottom-[calc(100%+10px)] left-1/2 max-h-72 w-60 -translate-x-1/2 overflow-y-auto rounded-2xl p-1.5 custom-scrollbar"
              >
                <p className="px-2.5 py-1.5 font-mono text-[10px] tracking-widest text-dark-900/40 uppercase">
                  {t('devZone.dock.statusHint')}
                </p>
                {STATUS_SERVICES.map((service) => {
                  const active = activeServiceIds.includes(service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      disabled={active}
                      onClick={() => {
                        onAdd('status', service.id);
                        setStatusOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition-colors',
                        active
                          ? 'cursor-default text-dark-900/35'
                          : 'text-dark-900 hover:bg-dark-900/5',
                      )}
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: service.accent }}
                      />
                      <span className="flex-1 truncate">{service.name}</span>
                      {active && (
                        <span className="font-mono text-[10px] text-dark-900/35">
                          {t('devZone.dock.added')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="mx-1 h-6 w-px bg-dark-900/10" aria-hidden="true" />

        <DockButton icon={<RotateCcw size={16} />} label={t('devZone.dock.reset')} onClick={onReset} />
      </div>
    </div>
  );
}

interface DockButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  trailing?: React.ReactNode;
}

function DockButton({ icon, label, onClick, active, trailing }: DockButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
        active ? 'bg-dark-900 text-cream-50' : 'text-dark-900 hover:bg-dark-900/5',
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {trailing}
    </button>
  );
}
