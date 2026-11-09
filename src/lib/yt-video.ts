// Shared YouTube player behaviour for Hero.astro and VideoFeature.astro
// (James, 10 Nov 2026):
//  - Starts by itself 2 seconds after the page opens. A video further down
//    the page starts as soon as it is scrolled into view (after those 2s).
//  - Tries to play WITH sound. Browsers refuse sound until the visitor has
//    tapped or clicked the page, so when that happens it keeps playing muted
//    and shows "Tap for sound"; the first tap or click anywhere on the page
//    then turns the sound on. While the sound is on the button reads
//    "Tap to mute".
//  - Only one video has sound at a time.
//  - When it ends, or is scrolled out of view, it goes back to its poster.
//  - Respects reduced motion: no autoplay, the play button still works.

interface Options {
  block: string;
  play: string;
  sound: string;
  startDelayMs?: number;
}

interface Entry {
  el: HTMLElement;
  inView: boolean;
  hasPlayer: () => boolean;
  isMuted: () => boolean;
  mute: () => void;
  unmute: () => void;
}

const w = window as any;
let apiReady: Promise<void> | null = null;
const entries = new Set<Entry>();
let gestureListening = false;

const API_SRC = 'https://www.youtube.com/iframe_api';

function loadApi(): Promise<void> {
  return (apiReady ??= new Promise<void>((resolve) => {
    if (w.YT?.Player) return resolve();
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector(`script[src="${API_SRC}"]`)) {
      const s = document.createElement('script');
      s.src = API_SRC;
      document.head.append(s);
    }
  }));
}

function listenForFirstGesture(skip: string) {
  if (gestureListening) return;
  gestureListening = true;
  const onGesture = (ev: Event) => {
    const target = ev.target as Element | null;
    if (target?.closest?.(skip)) return;
    window.removeEventListener('pointerdown', onGesture, true);
    window.removeEventListener('keydown', onGesture, true);
    const visible = [...entries].find((e) => e.inView && e.hasPlayer() && e.isMuted());
    visible?.unmute();
  };
  window.addEventListener('pointerdown', onGesture, true);
  window.addEventListener('keydown', onGesture, true);
}

export function initYtVideos({ block, play, sound, startDelayMs = 2000 }: Options) {
  const blocks = document.querySelectorAll<HTMLElement>(block);
  if (!blocks.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const openedAt = performance.now();
  listenForFirstGesture(`${play}, ${sound}`);

  blocks.forEach((el) => {
    const id = el.dataset.ytId;
    if (!id) return;
    const soundBtn = el.querySelector<HTMLButtonElement>(sound);
    let player: any = null;
    let autoStarted = false;

    const setMuted = (muted: boolean) => {
      el.classList.toggle('is-muted', muted);
      if (soundBtn) soundBtn.textContent = muted ? 'Tap for sound' : 'Tap to mute';
    };

    const entry: Entry = {
      el,
      inView: false,
      hasPlayer: () => !!player,
      isMuted: () => el.classList.contains('is-muted'),
      mute: () => {
        if (!player) return;
        try {
          player?.mute();
        } catch {}
        setMuted(true);
      },
      unmute: () => {
        if (!player) return;
        entries.forEach((other) => other !== entry && other.mute());
        player.unMute();
        player.playVideo();
        setMuted(false);
      },
    };
    entries.add(entry);

    const reset = () => {
      try {
        player?.destroy();
      } catch {}
      player = null;
      el.querySelector('iframe')?.remove();
      el.classList.remove('is-playing', 'is-muted');
    };

    const start = async () => {
      if (player) {
        entry.unmute();
        return;
      }
      await loadApi();
      const holder = document.createElement('div');
      el.append(holder);
      entries.forEach((other) => other !== entry && other.mute());
      setMuted(false);
      player = new w.YT.Player(holder, {
        videoId: id,
        host: 'https://www.youtube-nocookie.com',
        playerVars: { autoplay: 1, mute: 0, playsinline: 1, rel: 0, controls: 1 },
        events: {
          onReady: (e: any) => {
            e.target.unMute();
            e.target.playVideo();
            // If the browser refused to play with sound, play muted instead.
            window.setTimeout(() => {
              if (!player) return;
              if (player.getPlayerState() !== 1) {
                player.mute();
                player.playVideo();
                setMuted(true);
              } else {
                setMuted(!!player.isMuted());
              }
            }, 800);
          },
          onStateChange: (e: any) => {
            if (e.data === 1) el.classList.add('is-playing');
            if (e.data === 0) reset();
          },
        },
      });
    };

    const tryAutoStart = () => {
      if (autoStarted || reduceMotion || !entry.inView) return;
      if (performance.now() - openedAt < startDelayMs) return;
      autoStarted = true;
      start();
    };

    window.setTimeout(tryAutoStart, Math.max(0, startDelayMs - (performance.now() - openedAt)) + 50);

    el.querySelector(play)?.addEventListener('click', () => start());
    soundBtn?.addEventListener('click', () => (entry.isMuted() ? entry.unmute() : entry.mute()));

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        (observed) => {
          for (const o of observed) {
            entry.inView = o.isIntersecting && o.intersectionRatio >= 0.5;
            if (entry.inView) tryAutoStart();
            else if (!o.isIntersecting && player) reset();
          }
        },
        { threshold: [0, 0.5] },
      ).observe(el);
    } else {
      entry.inView = true;
    }
  });
}
