# swornmail.dev

Reference documentation for the SwornMail protocol. Public, protocol-only, and
non-normative: the Internet-Draft is the normative text, and where this site
disagrees with it the draft wins and the page is a bug.

Next.js static export, Tailwind, published to Cloudflare Pages by GitHub
Actions on merge to `main` — the same stack, design tokens and guards as
`swornmail.com`, deliberately, so the two read as one system.

```sh
npm install
npm run dev      # http://localhost:3000
npm run build    # static export into out/
```

## Deploying

CI publishes on every merge to `main` (`.github/workflows/deploy.yml`). Prefer
that path always.

**Never run `wrangler pages deploy out` from this working copy.** Local
development sessions can leave editor and tooling state inside `out/` — it is
git-ignored, so it never reaches the repository, but `wrangler pages deploy`
publishes whatever sits in the given directory on disk, not what git tracks.
Its behaviour toward dot-directories has not been verified, and this is not
the place to find out by testing in production. `deploy.yml` fails the build
if `out/` contains a dotfile or dot-directory for the same reason.

If a local deploy is ever genuinely necessary, run `rm -rf out && npm run
build` immediately beforehand and confirm `find out -name '.*'` prints
nothing before invoking wrangler.

## Pages

| Path | What |
|---|---|
| `/` | What SwornMail is, and what it deliberately does not do |
| `/deploy/` | Operator guide: keygen, genrecord, publish, verify, leaving testing mode |
| `/records/` | Every record tag, whether it is required, what makes a record malformed |
| `/verify/` | The five result values, reputation semantics, both deployment modes |
| `/implementations/` | Libraries, integrations, vectors, differential harnesses |

## Accuracy

Every technical claim was checked against the draft or the tooling, not
written from memory:

- Record tags, parsing rules and prefix constraints (/32–/64, canonical, within
  `2000::/3`) read from `draft-kafedzhy-swornmail-01.md` and confirmed against
  `MinPrefixLen`/`MaxPrefixLen` in the Go reference.
- The result table is the draft's own table.
- Terminal output is real `sworn` output; exit codes match the CLI's own usage
  text. The only edits are truncating a base64 key and eliding a token value.
- Module path and crate name confirmed from `go.mod` and `Cargo.toml`.
- The differential figure is stated as reproducible with its `--fuzz` default,
  not as a fixed number, for the same reason as on swornmail.com.

**If a page and the draft disagree, fix the page.** The draft is the contract.

## Design

Shares `globals.css`, the token palette and the component classes with
`swornmail.com`. The one addition is the documentation shell: a sidebar on wide
screens, a plain list above the content on narrow ones.

The sidebar is real links in a `<nav>`, not a JavaScript disclosure widget.
Reference documentation has to work with scripting off, and the whole map fits
on screen anyway. `NAV` in `app/site-chrome.tsx` is the single source of truth
for the map.

Verified in a browser across all five pages: zero horizontal overflow at a
320px viewport with all overflow confined to scroll containers, no
heading-level jumps, one `h1` per page, and every text/background pair at
5.89:1 or better in both themes against a 4.5 AA requirement.

## Deployment state

Published to Cloudflare Pages by GitHub Actions on merge to `main`, the same
stack and the same guards as `swornmail.com`. The two sites share `globals.css`,
the token palette and the component classes deliberately: they should read as
one system.

This site is non-normative. The Internet-Draft is the contract, and where a page
here disagrees with the draft, the page is the bug.
