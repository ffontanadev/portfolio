import { useState } from 'react';
import { Check, Pause, Play, RotateCcw, Settings, SkipForward, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';
import Widget from '../Widget';
import type { WidgetInstance } from '../types';
import { usePomodoro, type PomodoroConfig } from '../hooks/usePomodoro';

interface PomodoroWidgetProps {
  instance: WidgetInstance;
  interactive?: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onFocus: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRemove: (id: string) => void;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Configurable Pomodoro timer; config + daily progress persist to localStorage. */
export default function PomodoroWidget(props: PomodoroWidgetProps) {
  const { t } = useTranslation();
  const pomodoro = usePomodoro();
  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState<PomodoroConfig>(pomodoro.config);

  const phaseSeconds =
    (pomodoro.phase === 'work' ? pomodoro.config.workMinutes : pomodoro.config.breakMinutes) * 60;
  const progress = phaseSeconds > 0 ? 1 - pomodoro.secondsLeft / phaseSeconds : 0;

  const openSettings = () => {
    setDraft(pomodoro.config);
    setShowSettings(true);
  };

  const saveSettings = () => {
    pomodoro.updateConfig(draft);
    setShowSettings(false);
  };

  return (
    <Widget {...props} title={t('devZone.pomodoro.title')} icon={<Timer size={14} />}>
      {showSettings ? (
        <div className="space-y-3">
          {(
            [
              { key: 'workMinutes', label: t('devZone.pomodoro.workLabel'), min: 1, max: 180 },
              { key: 'breakMinutes', label: t('devZone.pomodoro.breakLabel'), min: 1, max: 180 },
              { key: 'dailyGoal', label: t('devZone.pomodoro.goalLabel'), min: 1, max: 24 },
            ] as const
          ).map((field) => (
            <label key={field.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-dark-900/70">{field.label}</span>
              <input
                type="number"
                min={field.min}
                max={field.max}
                value={draft[field.key]}
                onChange={(event) =>
                  setDraft((d) => ({ ...d, [field.key]: Number(event.target.value) }))
                }
                className="w-16 rounded-lg border border-dark-900/15 bg-white/60 px-2 py-1 text-right font-mono text-sm text-dark-900 focus:border-coral-500 focus:outline-none"
              />
            </label>
          ))}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={saveSettings}
              className="flex-1 rounded-lg bg-dark-900 px-3 py-2 text-sm font-medium text-cream-50 transition-colors hover:bg-coral-500"
            >
              {t('devZone.pomodoro.save')}
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="rounded-lg border border-dark-900/15 px-3 py-2 text-sm text-dark-900/70 transition-colors hover:bg-dark-900/5"
            >
              {t('devZone.pomodoro.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'rounded-full px-2.5 py-1 font-mono text-[10px] tracking-widest uppercase',
                pomodoro.phase === 'work'
                  ? 'bg-coral-500/12 text-coral-500'
                  : 'bg-teal-500/15 text-teal-700',
              )}
            >
              {pomodoro.phase === 'work'
                ? t('devZone.pomodoro.phaseWork')
                : t('devZone.pomodoro.phaseBreak')}
            </span>
            <button
              type="button"
              onClick={openSettings}
              className="rounded-md p-1 text-dark-900/40 transition-colors hover:bg-dark-900/5 hover:text-dark-900"
              aria-label={t('devZone.pomodoro.settings')}
            >
              <Settings size={15} />
            </button>
          </div>

          <p className="my-2 text-center font-mono text-5xl font-semibold tabular-nums text-dark-900">
            {formatTime(pomodoro.secondsLeft)}
          </p>

          <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-dark-900/10">
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-1000 ease-linear',
                pomodoro.phase === 'work' ? 'bg-coral-500' : 'bg-teal-500',
              )}
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={pomodoro.toggle}
              className="flex size-11 items-center justify-center rounded-full bg-dark-900 text-cream-50 transition-transform hover:scale-105 active:scale-95"
              aria-label={pomodoro.isRunning ? t('devZone.pomodoro.pause') : t('devZone.pomodoro.start')}
            >
              {pomodoro.isRunning ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
            </button>
            <button
              type="button"
              onClick={pomodoro.skip}
              className="rounded-full p-2 text-dark-900/60 transition-colors hover:bg-dark-900/5 hover:text-dark-900"
              aria-label={t('devZone.pomodoro.skip')}
            >
              <SkipForward size={18} />
            </button>
            <button
              type="button"
              onClick={pomodoro.reset}
              className="rounded-full p-2 text-dark-900/60 transition-colors hover:bg-dark-900/5 hover:text-dark-900"
              aria-label={t('devZone.pomodoro.reset')}
            >
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="mt-4 border-t border-dark-900/10 pt-3">
            <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] tracking-widest text-dark-900/40 uppercase">
              <span>{t('devZone.pomodoro.today')}</span>
              <span className={cn(pomodoro.goalReached && 'text-teal-700')}>
                {pomodoro.completedToday}/{pomodoro.config.dailyGoal}
                {pomodoro.goalReached && <Check size={11} className="ml-1 inline" />}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: pomodoro.config.dailyGoal }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    'size-2.5 rounded-full',
                    index < pomodoro.completedToday ? 'bg-coral-500' : 'bg-dark-900/12',
                  )}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </Widget>
  );
}
