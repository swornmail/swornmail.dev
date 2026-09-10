import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://swornmail.dev"),
  // Declared explicitly because `trailingSlash: true` means /deploy and
  // /deploy/ both resolve; without this a crawler picks its own winner.
  alternates: { canonical: "/" },
  title: "SwornMail documentation — IPv6 prefix attestation for SMTP",
  description:
    "Reference documentation for the SwornMail protocol: DNS record format, verification and result codes, operator deployment, and the reference implementations.",
  // No image is referenced on purpose: a preview fetcher pulling an image is
  // still an external request, and there is no product screenshot worth
  // showing because there is no product.
  openGraph: {
    type: "website",
    url: "https://swornmail.dev/",
    title: "SwornMail documentation — IPv6 prefix attestation for SMTP",
    description:
      "DNS record format, verification and result codes, operator deployment, and the reference implementations.",
  },
  twitter: { card: "summary" },
  // Same-origin SVG favicon. Still no external request, and unlike the data:
  // URI it replaces, it is a URL a search engine can fetch and show.
  icons: { icon: "/favicon.svg" },
};

/**
 * Structured data for the documentation site as a whole. Individual pages add
 * a TechArticle node of their own; this establishes the collection they
 * belong to.
 *
 * Nothing here asserts adoption, an organisation, or a product, because none
 * of those exist. The non-normative caveat is carried in the description
 * rather than left for the reader to discover on the page.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://swornmail.dev/#website",
      url: "https://swornmail.dev/",
      name: "SwornMail documentation",
      description:
        "Non-normative reference documentation for the SwornMail protocol. The Internet-Draft is the normative text.",
      inLanguage: "en",
      publisher: { "@id": "https://swornmail.dev/#maintainer" },
    },
    {
      "@type": "Person",
      "@id": "https://swornmail.dev/#maintainer",
      name: "Val Kafedzhy",
      url: "https://github.com/swornmail",
    },
  ],
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
        {/* JSON-LD. Inert data rather than executable code, and built from a
            module-scope constant with no runtime input, so it carries the same
            (absent) XSS risk as the theme bootstrap above. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
