import { ThemeToggle } from "./theme-toggle";

/* Shared class strings, named because they encode a decision rather than to
   save characters. Kept identical to swornmail.com so the two sites read as
   one system — a reader moving from the advocacy site to the reference should
   not feel a seam. */
export const WRAP = "mx-auto w-full max-w-[78rem] px-[1.1rem] sm:px-6";
export const PROSE = "max-w-[38rem]";
export const H2 =
  "mt-12 mb-2 scroll-mt-20 text-[1.375rem] font-semibold leading-tight tracking-[-0.015em]";
export const H3 = "mt-8 mb-2 scroll-mt-20 text-[1.0625rem] font-semibold leading-tight";
export const LEDE = "mb-8 max-w-[38rem] text-[1.0625rem] text-muted";
export const LABEL =
  "mb-4 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted";
export const LINK =
  "text-accent underline decoration-1 underline-offset-2 hover:text-accent-deep";
export const NOTE = "my-6 border-l-2 border-firm pl-[1.1rem]";
export const NOTE_FLAG = "my-6 border-l-2 border-flag pl-[1.1rem]";
export const CAPTION = "mb-6 max-w-[52ch] text-[0.8125rem] text-muted";

export function C({ children }: { children: React.ReactNode }) {
  return <code className="inline-code">{children}</code>;
}

/** A reference table that scrolls inside itself rather than widening the page. */
export function Table({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-[0.9375rem]">
        <thead>
          <tr>
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className="border-b border-rule px-[0.9rem] py-[0.7rem] text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:border-b [&_td]:border-rule [&_td]:px-[0.9rem] [&_td]:py-[0.7rem] [&_td]:align-top [&_th]:border-b [&_th]:border-rule [&_th]:px-[0.9rem] [&_th]:py-[0.7rem] [&_th]:text-left [&_th]:align-top [&_th]:font-semibold">
        {children}
        </tbody>
      </table>
    </div>
  );
}

/** The documentation map. One place, so the sidebar and any future index agree. */
export const NAV: { title: string; items: { href: string; label: string }[] }[] = [
  {
    title: "Start",
    items: [
      { href: "/", label: "Overview" },
      { href: "/deploy/", label: "Deploy as an operator" },
    ],
  },
  {
    title: "Reference",
    items: [
      { href: "/records/", label: "DNS records" },
      { href: "/verify/", label: "Verification and results" },
    ],
  },
  {
    title: "Implementations",
    items: [{ href: "/implementations/", label: "Libraries and integrations" }],
  },
];

export function Masthead() {
  return (
    <header className="sticky top-0 z-[5] border-b border-rule bg-paper/90 backdrop-blur">
      <div className={`${WRAP} flex min-h-14 flex-wrap items-center gap-5`}>
        <a
          href="/"
          className="mr-auto text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink"
        >
          SwornMail{" "}
          <span className="font-normal text-muted">docs</span>
        </a>
        <nav aria-label="Site" className="flex flex-wrap items-center gap-5">
          <a
            href="https://swornmail.com"
            className="text-sm text-muted hover:text-accent hover:underline"
          >
            swornmail.com
          </a>
          <a
            href="https://github.com/swornmail"
            className="text-sm text-muted hover:text-accent hover:underline"
          >
            GitHub
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

/**
 * The documentation shell: a sidebar on wide screens, a plain list above the
 * content on narrow ones.
 *
 * The sidebar is a real <nav> with links, not a JavaScript disclosure widget.
 * Reference documentation has to work in a browser with scripting off, and
 * the whole map fits on screen anyway.
 */
export function DocShell({
  current,
  children,
}: {
  current: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${WRAP} gap-10 py-8 lg:grid lg:grid-cols-[14rem_1fr] lg:py-12`}>
      <nav
        aria-label="Documentation"
        className="mb-10 border-b border-rule pb-8 lg:mb-0 lg:border-0 lg:pb-0"
      >
        <div className="lg:sticky lg:top-20">
          {NAV.map((group) => (
            <div key={group.title} className="mb-6 last:mb-0">
              <p className="mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted">
                {group.title}
              </p>
              <ul className="space-y-1.5">
                {group.items.map((item) => {
                  const active = item.href === current;
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={
                          active
                            ? "text-sm font-medium text-ink"
                            : "text-sm text-muted hover:text-accent hover:underline"
                        }
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <main id="main" className="min-w-0">
        {children}
      </main>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-rule py-10 text-sm text-muted">
      <div className={WRAP}>
        <p className="max-w-[60ch] text-[0.8125rem]">
          SwornMail is an open protocol, licensed Apache-2.0. These documents
          describe Internet-Draft <C>draft-kafedzhy-swornmail</C>, which is{" "}
          <strong>not an IETF standard</strong> and has no IETF consensus. The
          normative text is the draft itself; where this site and the draft
          disagree, the draft wins.
        </p>
        <p className="mt-4 max-w-[60ch] text-[0.8125rem]">
          Maintained by Val Kafedzhy. Corrections:{" "}
          <a href="mailto:val@sworn.email" className={LINK}>
            val@sworn.email
          </a>{" "}
          or{" "}
          <a href="https://github.com/swornmail/spec/issues" className={LINK}>
            open an issue
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
