import { useEffect, useRef, useState } from 'react';
import {
  Loader2,
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useTranslation } from '@/i18n';
import Widget from '../Widget';
import type { WidgetInstance } from '../types';
import { DEFAULT_STATION_ID, RADIO_STATIONS } from '../data/radioStations';

interface MusicWidgetProps {
  instance: WidgetInstance;
  interactive?: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onFocus: (id: string) => void;
  onTogglePin: (id: string) => void;
  onRemove: (id: string) => void;
}

const STORAGE_KEY = 'portfolio.devzone.music.v1';

interface MusicPrefs {
  stationId: string;
  volume: number; // 0..1
}

function readPrefs(): MusicPrefs {
  const fallback: MusicPrefs = { stationId: DEFAULT_STATION_ID, volume: 0.7 };
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<MusicPrefs>;
    const stationExists = RADIO_STATIONS.some((s) => s.id === parsed.stationId);
    return {
      stationId: stationExists ? (parsed.stationId as string) : DEFAULT_STATION_ID,
      volume: typeof parsed.volume === 'number' ? Math.min(1, Math.max(0, parsed.volume)) : 0.7,
    };
  } catch {
    return fallback;
  }
}

/**
 * Lofi/ambient radio player backed by SomaFM streams via a native <audio>
 * element, with real pause and volume control. Station and volume preferences
 * persist to localStorage.
 */
export default function MusicPlayerWidget(props: MusicWidgetProps) {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [prefs, setPrefs] = useState<MusicPrefs>(readPrefs);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [muted, setMuted] = useState(false);

  const stationIndex = Math.max(
    0,
    RADIO_STATIONS.findIndex((s) => s.id === prefs.stationId),
  );
  const station = RADIO_STATIONS[stationIndex];

  // Persist preferences.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [prefs]);

  // Keep the audio element's volume in sync.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : prefs.volume;
  }, [prefs.volume, muted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    setHasError(false);
    setIsLoading(true);
    audio.volume = muted ? 0 : prefs.volume;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        setHasError(true);
        setIsLoading(false);
      });
  };

  const changeStation = (direction: 1 | -1) => {
    const next = (stationIndex + direction + RADIO_STATIONS.length) % RADIO_STATIONS.length;
    setPrefs((p) => ({ ...p, stationId: RADIO_STATIONS[next].id }));
  };

  // When the station changes, resume playback if we were already playing.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      setIsLoading(true);
      setHasError(false);
      audio.play().catch(() => {
        setHasError(true);
        setIsLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.stationId]);

  const volumePct = Math.round(prefs.volume * 100);

  return (
    <Widget
      {...props}
      title={t('devZone.music.title')}
      icon={<Music2 size={14} />}
      accent="var(--color-purple-500)"
    >
      <audio
        ref={audioRef}
        src={station.streamUrl}
        preload="none"
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          if (isPlaying || isLoading) setHasError(true);
          setIsLoading(false);
          setIsPlaying(false);
        }}
      />

      <div className="mb-3">
        <p className="font-mono text-[10px] tracking-widest text-dark-900/40 dark:text-cream-50/40 uppercase">
          {t('devZone.music.nowPlaying')}
        </p>
        <p className="truncate font-display text-lg leading-tight font-semibold text-dark-900 dark:text-cream-50">
          {station.name}
        </p>
        <p className="truncate text-xs text-dark-900/50 dark:text-cream-50/50">
          {hasError ? t('devZone.music.error') : station.description}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => changeStation(-1)}
          className="rounded-full p-2 text-dark-900/60 transition-colors hover:bg-dark-900/5 hover:text-dark-900 dark:text-cream-50/60 dark:hover:bg-cream-50/10 dark:hover:text-cream-50"
          aria-label={t('devZone.music.previous')}
        >
          <SkipBack size={18} />
        </button>
        <button
          type="button"
          onClick={togglePlay}
          className="flex size-11 items-center justify-center rounded-full bg-dark-900 text-cream-50 transition-transform hover:scale-105 active:scale-95 dark:bg-cream-50 dark:text-dark-900"
          aria-label={isPlaying ? t('devZone.music.pause') : t('devZone.music.play')}
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={18} />
          ) : (
            <Play size={18} className="translate-x-0.5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => changeStation(1)}
          className="rounded-full p-2 text-dark-900/60 transition-colors hover:bg-dark-900/5 hover:text-dark-900 dark:text-cream-50/60 dark:hover:bg-cream-50/10 dark:hover:text-cream-50"
          aria-label={t('devZone.music.next')}
        >
          <SkipForward size={18} />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="text-dark-900/50 transition-colors hover:text-dark-900 dark:text-cream-50/50 dark:hover:text-cream-50"
          aria-label={muted ? t('devZone.music.unmute') : t('devZone.music.mute')}
        >
          {muted || prefs.volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={muted ? 0 : volumePct}
          onChange={(event) => {
            const value = Number(event.target.value) / 100;
            setMuted(false);
            setPrefs((p) => ({ ...p, volume: value }));
          }}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-dark-900/15 dark:bg-cream-50/15 accent-coral-500"
          aria-label={t('devZone.music.volume')}
        />
        <span className="w-8 text-right font-mono text-[10px] text-dark-900/40 dark:text-cream-50/40">
          {muted ? 0 : volumePct}
        </span>
      </div>
    </Widget>
  );
}
