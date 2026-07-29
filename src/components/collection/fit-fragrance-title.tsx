"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const MAX_FONT_SIZE = 72;
const MIN_FONT_SIZE = 38;

type FitFragranceTitleProps = {
  children: string;
  className?: string;
};

export function FitFragranceTitle({ children, className }: FitFragranceTitleProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState(MAX_FONT_SIZE);

  useEffect(() => {
    const title = titleRef.current;

    if (!title) {
      return;
    }

    let frame = 0;

    const fitTitle = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const availableWidth = title.clientWidth;

        if (availableWidth <= 0) {
          return;
        }

        title.style.fontSize = `${MAX_FONT_SIZE}px`;
        const measuredWidth = title.scrollWidth;
        const nextSize =
          measuredWidth > availableWidth
            ? Math.max(MIN_FONT_SIZE, Math.floor((MAX_FONT_SIZE * availableWidth) / measuredWidth))
            : MAX_FONT_SIZE;

        title.style.fontSize = "";
        setFontSize(nextSize);
      });
    };

    fitTitle();

    if (typeof globalThis.ResizeObserver === "undefined") {
      globalThis.addEventListener("resize", fitTitle);

      return () => {
        window.cancelAnimationFrame(frame);
        globalThis.removeEventListener("resize", fitTitle);
      };
    }

    const observer = new ResizeObserver(fitTitle);
    observer.observe(title);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [children]);

  return (
    <h1
      ref={titleRef}
      className={className}
      style={{ "--fit-title-size": `${fontSize}px` } as CSSProperties}
    >
      {children}
    </h1>
  );
}
