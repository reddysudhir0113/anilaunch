/**
 * GSAP Animation Utilities & React Hooks for AniLaunch
 * Butter-smooth entrances, stagger reveals, and fluid interactions.
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Hook to stagger-reveal children of a container on mount or when dependencies change.
 * Silky smooth power3.out ease.
 */
export function useGsapStagger(dependencies = [], options = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const children = containerRef.current.children;
    if (!children || children.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        children,
        {
          opacity: 0,
          y: options.y ?? 20,
          scale: options.scale ?? 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: options.duration ?? 0.5,
          stagger: options.stagger ?? 0.05,
          ease: options.ease ?? 'power3.out',
          clearProps: 'transform,opacity',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, dependencies);

  return containerRef;
}

/**
 * Hook to fade-in and slide an individual element on mount.
 */
export function useGsapFadeIn(options = {}) {
  const elRef = useRef(null);

  useEffect(() => {
    if (!elRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elRef.current,
        {
          opacity: 0,
          y: options.y ?? 16,
        },
        {
          opacity: 1,
          y: 0,
          duration: options.duration ?? 0.5,
          delay: options.delay ?? 0,
          ease: options.ease ?? 'power2.out',
          clearProps: 'transform,opacity',
        }
      );
    }, elRef);

    return () => ctx.revert();
  }, []);

  return elRef;
}

/**
 * Butter-smooth interactive hover helpers using GSAP
 * Subtle lifts, elastic settles, soft lighting adjustments.
 */
export const gsapCardHover = {
  onEnter: (e) => {
    gsap.to(e.currentTarget, {
      y: -4,
      duration: 0.35,
      ease: 'power2.out',
      boxShadow:
        '10px 18px 30px rgba(160, 175, 205, 0.22), -6px -6px 18px rgba(255, 255, 255, 0.95)',
      overwrite: 'auto',
    });
  },
  onLeave: (e) => {
    gsap.to(e.currentTarget, {
      y: 0,
      duration: 0.45,
      ease: 'power3.out',
      boxShadow:
        '8px 12px 24px rgba(160, 175, 205, 0.16), -6px -6px 16px rgba(255, 255, 255, 0.92)',
      overwrite: 'auto',
    });
  },
};

export const gsapButtonPress = {
  onMouseDown: (e) => {
    gsap.to(e.currentTarget, {
      scale: 0.96,
      duration: 0.12,
      ease: 'power2.in',
      overwrite: 'auto',
    });
  },
  onMouseUp: (e) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.35,
      ease: 'back.out(2)',
      overwrite: 'auto',
    });
  },
  onMouseLeave: (e) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.25,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  },
};
