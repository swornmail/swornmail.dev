"use client";

import { useEffect, useState } from "react";

/**
 * The only interactive element on the site, and the only client component.
 *
 * Progressive enhancement: both themes already work without it, chosen by
 * prefers-color-scheme. The button is hidden by CSS until the bootstrap script
 * in the layout adds `js` to the root element, so a reader with JavaScript
 * disabled never sees a control that cannot work.
 */
export function ThemeToggle() {
  // Rendered as null on the server and on first paint. The correct label
  // depends on localStorage and the OS preference, neither of which exists at
  // build time, and rendering a guess would either flash or lie.
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const explicit = document.documentElement.dataset.theme;
    if (explicit === "light" || explicit === "dark") {
      setTheme(explicit);
      return;
    }
    setTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
    );
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode or blocked storage. The theme still applies for this
      // page view; it just will not be remembered, which is not worth an error.
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-live="polite"
      // aria-hidden while the label is unknown, so a screen reader is never
      // handed a button whose name has not been decided yet.
      aria-hidden={theme === null}
      className="theme-toggle cursor-pointer rounded border border-firm px-[0.55rem] py-[0.2rem] text-[0.8125rem] text-muted hover:border-accent hover:text-accent"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
