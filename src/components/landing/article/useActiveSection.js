import { useEffect, useState } from 'react';

/** Where the "current" line sits: just below the sticky header. */
function readingLine() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--ls-header-h');
  const header = Number.parseFloat(raw);

  return (Number.isFinite(header) ? header : 71) + 24;
}

/**
 * Reports which of `ids` is the section a reader is currently in.
 *
 * This reads positions on scroll rather than using an IntersectionObserver.
 * An observer answers "is this section on screen", which is the wrong question
 * here: the long sections in these articles fill the viewport on their own, so
 * several are intersecting at once and the short closing sections never are.
 * Comparing each section's top against a single line below the header answers
 * "which one am I reading", which is what the contents rail needs to show.
 *
 * Work is thrown away between frames, and the listener is passive, so this
 * costs one `getBoundingClientRect` per section per painted frame at most.
 *
 * `ids` must be referentially stable -- every caller passes a list derived
 * from a module-level constant.
 */
export default function useActiveSection(ids) {
  const [active, setActive] = useState(() => ids[0] ?? null);

  useEffect(() => {
    if (!ids.length) return undefined;

    let frame = 0;

    const read = () => {
      frame = 0;

      const line = readingLine();
      let current = ids[0];

      for (const id of ids) {
        const node = document.getElementById(id);
        if (node && node.getBoundingClientRect().top <= line) current = id;
      }

      // A closing section is often too short to ever push its heading past the
      // line, so it would never light up. Reaching the end of the page means
      // the reader is in it regardless of where its top sits.
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atEnd) current = ids[ids.length - 1];

      setActive(current);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ids]);

  return active;
}
