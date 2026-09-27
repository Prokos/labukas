import React, { useEffect, useLayoutEffect } from "react";
import { X } from "lucide-react";

// The existing course session shell, shared with the opening preview.
export default function LessonShell({
  sessionRef,
  inputRef,
  title,
  headerLabel,
  count,
  percent,
  onClose,
  children,
  className = "",
  ...props
}) {
  useEffect(() => {
    const prev = document.activeElement;
    const scrollY = window.scrollY;
    const savedStyle = document.body.getAttribute("style");
    Object.assign(document.body.style, {
      overflow: "hidden",
      position: "fixed",
      top: `-${scrollY}px`,
      width: "100%",
    });
    if (!sessionRef.current?.contains(document.activeElement)) {
      (inputRef?.current || sessionRef.current?.querySelector("button"))?.focus(
        {
          preventScroll: true,
        },
      );
    }
    function trap(e) {
      if (e.key !== "Tab") return;
      const root =
        sessionRef.current?.querySelector("[role=alertdialog]") ||
        sessionRef.current;
      const els = [
        ...root.querySelectorAll(
          "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), summary, a[href]",
        ),
      ];
      const first = els[0],
        last = els.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus({ preventScroll: true });
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus({ preventScroll: true });
      }
    }
    document.addEventListener("keydown", trap);
    return () => {
      if (savedStyle === null) document.body.removeAttribute("style");
      else document.body.setAttribute("style", savedStyle);
      window.scrollTo(0, scrollY);
      document.removeEventListener("keydown", trap);
      prev?.focus({ preventScroll: true });
    };
  }, []);
  useLayoutEffect(() => {
    const viewport = window.visualViewport;
    const keyboard = navigator.virtualKeyboard;
    const root = sessionRef.current;
    let frame;
    let fullHeight = window.innerHeight;
    function resize() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const top = viewport?.offsetTop || 0;
        // Respect both browser layout resizing and visual-viewport resizing.
        // Do not opt into keyboard overlays: let the browser resize normally.
        let bottom = Math.min(
          window.innerHeight,
          top + (viewport?.height || window.innerHeight),
        );
        if (keyboard?.boundingRect.height > 0)
          bottom = Math.min(bottom, keyboard.boundingRect.top);
        const height = Math.max(0, bottom - top);
        fullHeight = Math.max(fullHeight, window.innerHeight);
        root.style.setProperty("--session-height", `${height}px`);
        root.style.setProperty("--session-top", `${top}px`);
        if (fullHeight - height > 150 || keyboard?.boundingRect.height > 0) {
          // Move the WHOLE lesson up to reveal the in-flow action. The header
          // scrolls away with the question; nothing is pinned over the content.
          root.scrollTop = root.scrollHeight;
        }
      });
    }
    resize();
    viewport?.addEventListener("resize", resize);
    viewport?.addEventListener("scroll", resize);
    keyboard?.addEventListener("geometrychange", resize);
    window.addEventListener("resize", resize);
    root.addEventListener("focusin", resize);
    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener("resize", resize);
      viewport?.removeEventListener("scroll", resize);
      keyboard?.removeEventListener("geometrychange", resize);
      window.removeEventListener("resize", resize);
      root.removeEventListener("focusin", resize);
    };
  }, []);
  return (
    <div
      className={`session ${className}`}
      ref={sessionRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      {...props}
    >
      <div className="session-top">
        <button
          className="icon-button"
          aria-label="Close lesson"
          onClick={onClose}
        >
          <X size={25} />
        </button>
        <div className="session-top-middle">
          <span>{headerLabel}</span>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Lesson progress"
            aria-valuenow={Math.round(percent)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div style={{ width: `${percent}%` }} />
          </div>
        </div>
        <span className="session-count">{count}</span>
      </div>
      {children}
    </div>
  );
}
