import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import type { Project } from './projectTypes';
import { TypographicHero, HeroOverlayContent, HERO_RADIAL_BG } from './ProjectPreviewModal';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface VideoShowcaseHeroProps {
    project: Project;
    /** Public paths to the playlist clips, in order. */
    videos: string[];
    size?: 'card' | 'modal';
}

/** Light cream scrim so the dark overlay type stays legible over any footage. */
const SCRIM_BG =
    'radial-gradient(ellipse 70% 90% at 50% 40%, rgba(255,248,243,0.72), rgba(255,248,243,0.34) 60%, rgba(255,248,243,0.12))';

/**
 * Ambient, auto-cycling video background for a flagship banner. Clips play
 * muted and inline, advancing through the playlist endlessly, with the shared
 * HeroOverlayContent on top. Degrades to the static TypographicHero when the
 * user prefers reduced motion, when a clip fails to load, or when no clips are
 * provided. Pauses while scrolled offscreen to save resources.
 */
const VideoShowcaseHero = ({ project, videos, size = 'modal' }: VideoShowcaseHeroProps) => {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [index, setIndex] = useState(0);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    // 300px of lead time: start fetching just before the banner scrolls in, so
    // the first frame is ready by the time it is actually on screen.
    const inView = useInView(containerRef, { margin: '300px' });

    // Same element, but `once` keeps returning true after the first entry. The
    // `src` hangs off this rather than off `inView` so scrolling back and forth
    // doesn't restart the fetch, while `inView` still drives pause/resume.
    const armed = useInView(containerRef, { once: true, margin: '300px' });

    const isModal = size === 'modal';

    // Pause when scrolled offscreen; resume when back in view. The `index` dep
    // also retries play() on each new clip in case autoplay is blocked by policy.
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !armed) return;
        if (inView) {
            void video.play().catch(() => {
                /* Autoplay may be rejected by the browser; the static look still holds. */
            });
        } else {
            video.pause();
        }
    }, [inView, index, armed]);

    // No clips, reduced motion, or a load failure → static hero.
    if (!videos.length || prefersReducedMotion || failed) {
        return <TypographicHero project={project} size={size} />;
    }

    const handleEnded = () => {
        setReady(false); // brief fade-out before the next clip fades in
        setIndex((current) => (current + 1) % videos.length);
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full overflow-hidden bg-cream-100 ${isModal ? 'aspect-[21/9]' : 'h-full'}`}
        >
            {/* Cream wash underlay — prevents any flash before the first frame loads. */}
            <div
                className="absolute inset-0 opacity-60"
                style={{ background: HERO_RADIAL_BG }}
                aria-hidden="true"
            />

            {/* Ambient clip. An index-based `key` remounts the element on every advance
                so the new src plays; a lone clip uses native `loop` instead.

                `src` stays undefined until `armed`, and there is no `autoPlay`
                attribute, for two reasons that compound badly otherwise:
                `autoPlay` overrides `preload`, so the browser buffers the whole
                clip regardless; and this banner sits ~2000px down the page, so
                that download would otherwise start during the prerendered
                snapshot — before any script runs — and saturate the connection
                while the hero is still trying to paint. Playback is driven from
                the effect above instead, once the element is actually near the
                viewport. */}
            <video
                ref={videoRef}
                key={index}
                src={armed ? videos[index] : undefined}
                muted
                playsInline
                loop={videos.length === 1}
                preload="none"
                aria-hidden="true"
                onCanPlay={() => setReady(true)}
                onEnded={handleEnded}
                onError={() => setFailed(true)}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    ready ? 'opacity-100' : 'opacity-0'
                }`}
            />

            {/* Legibility scrim between footage and overlay. */}
            <div className="absolute inset-0" style={{ background: SCRIM_BG }} aria-hidden="true" />

            {/* § corner mark, matching the static hero. */}
            <div
                className="absolute inset-x-5 top-5 flex items-center justify-between text-dark-900/45"
                aria-hidden="true"
            >
                <span className="font-display italic text-sm" style={{ fontStyle: 'italic' }}>
                    §
                </span>
            </div>

            {/* Shared identity overlay — identical typography to the static hero. */}
            <HeroOverlayContent project={project} size={size} />
        </div>
    );
};

export default VideoShowcaseHero;
