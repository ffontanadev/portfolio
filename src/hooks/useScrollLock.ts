import { useEffect } from 'react';

/**
 * Shared body scroll lock.
 *
 * Every overlay used to own `document.body.style.overflow` outright: lock it
 * on open, and clear it on close *and* on unmount. That works while exactly one
 * overlay exists. It stopped working once the archive gained a deep link,
 * because `?archive=<id>` opens the project modal during the very first render,
 * at which point the always-mounted resume viewer is also running its effect -
 * with `isOpen` false - and clears the lock the modal just took. The page
 * scrolled behind an open modal, and only on a cold load, which is exactly the
 * kind of bug that survives manual testing.
 *
 * A counter fixes the class of bug rather than that one instance: the lock
 * lifts when the last holder releases it, not when the first one closes.
 */
let holders = 0;

export function useScrollLock(active: boolean): void {
    useEffect(() => {
        if (!active) return;

        holders += 1;
        document.body.style.overflow = 'hidden';

        return () => {
            holders -= 1;
            if (holders === 0) document.body.style.overflow = '';
        };
    }, [active]);
}
