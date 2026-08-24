import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://swornmail.dev"),
  title: "SwornMail documentation",
  description:
    "Reference documentation for the SwornMail protocol: DNS record format, verification and result codes, operator deployment, and the reference implementations.",
  // No image is referenced on purpose: a preview fetcher pulling an image is
  // still an external request, and there is no product screenshot worth
  // showing because there is no product.
  openGraph: {
    type: "website",
    url: "https://swornmail.dev/",
    title: "SwornMail documentation",
    description:
      "DNS record format, verification and result codes, operator deployment, and the reference implementations.",
  },
  twitter: { card: "summary" },
  // Inline SVG favicon: no external request, no file to serve.
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%2314487A'/%3E%3Cpath d='M8 11h16M8 16h16M8 21h9' stroke='%23fff' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E",
  },
};

// Applied before first paint so the page never flashes the wrong theme. It
// runs ahead of hydration, which is the only reason it is inlined rather than
// living in the toggle component.
const themeBootstrap = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}document.documentElement.classList.add('js')})()`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* dangerouslySetInnerHTML is correct here and carries no XSS risk:
            the payload is a module-scope constant defined directly above,
            with no interpolation and no runtime input of any kind. It has to
            be inlined and blocking so the theme is set before first paint;
            deferring it to a component would reintroduce the flash it exists
            to prevent. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
