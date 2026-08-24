import {
  Masthead,
  DocShell,
  Footer,
  C,
  H2,
  H3,
  LEDE,
  LINK,
  NOTE,
  NOTE_FLAG,
  PROSE,
  LABEL,
} from "./site-chrome";

export const metadata = {
  title: "SwornMail documentation",
  description:
    "What SwornMail is, what it does not do, and where to go next: record format, verification, deployment, implementations.",
};

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="absolute left-[-9999px] z-10 bg-accent px-4 py-[0.6rem] text-white focus:left-0 focus:top-0"
      >
        Skip to content
      </a>
      <Masthead />
      <DocShell current="/">
        <p className={LABEL}>Overview</p>
        <h1 className="mb-4 text-[2rem] font-semibold leading-tight tracking-[-0.015em]">
          SwornMail
        </h1>
        <p className={LEDE}>
          An operator publishes a signed, verifiable claim that a range of IPv6
          address space is one accountable entity, staked on their domain name.
          Receivers get a stable reputation unit instead of 2<sup>64</sup>
          &nbsp;addresses they cannot reason about.
        </p>

        <div className={NOTE_FLAG}>
          <p className={PROSE}>
            <strong>Status.</strong> SwornMail is an Internet-Draft, not an IETF
            standard, and has no IETF consensus. The <C>-01</C> wire format is
            frozen and backed by 62 published conformance vectors and two
            independent implementations. There are no public deployments.
          </p>
        </div>

        <h2 className={H2} id="what-it-does">
          What it does
        </h2>
        <p className={PROSE}>
          An operator publishes two DNS TXT records: a{" "}
          <a href="/records/#key" className={LINK}>
            key record
          </a>{" "}
          carrying a signing key, and a{" "}
          <a href="/records/#policy" className={LINK}>
            policy record
          </a>{" "}
          naming the prefixes they stand behind and the granularity at which
          they are willing to be judged.
        </p>
        <p className={`${PROSE} mt-4`}>
          A receiver, at connection time and before message data, establishes
          which operator is accountable for the connecting address and confirms
          the address really falls inside a prefix that operator attested. On{" "}
          <C>sworn=pass</C> it keys reputation on{" "}
          <C>(operator domain, unit prefix)</C> rather than on an individual
          address.
        </p>

        <h3 className={H3}>Two deployment modes</h3>
        <p className={PROSE}>
          <strong>Mode 1, DNS-only.</strong> Publish the records; nothing in
          your mail software changes. The receiver discovers the operator from
          the connecting address. This is the baseline the protocol is designed
          around and it is deployable today.
        </p>
        <p className={`${PROSE} mt-4`}>
          <strong>Mode 2, signed token.</strong> An SMTP extension carries a
          compact COSE-signed token verified statelessly at connection time,
          for stronger source authenticity. It requires software that speaks
          the extension — notably, a milter cannot advertise it, because
          milters run after the command phase.
        </p>

        <h2 className={H2} id="what-it-does-not-do">
          What it deliberately does not do
        </h2>
        <p className={PROSE}>
          Reading this list first will save you time, because several of these
          are the first thing people assume SwornMail is for.
        </p>
        <ul className={`${PROSE} mt-4 list-disc space-y-2 pl-[1.1rem]`}>
          <li>
            <strong>It does not authenticate messages.</strong> That is DKIM&rsquo;s
            job. SwornMail attests the connection&rsquo;s address space and says
            nothing about any message carried over it.
          </li>
          <li>
            <strong>It does not authorise a sender for a domain.</strong> That
            is SPF&rsquo;s job, and it needs a claimed identity to check against.
            SwornMail asserts something about the address space itself, which is
            why it works for a sender whose domain you have never seen.
          </li>
          <li>
            <strong>Attestation is not endorsement.</strong> Publishing a record
            does not ask anyone to trust you; it says who to hold responsible.
            Receivers and reputation services decide what that is worth.
          </li>
          <li>
            <strong>It never makes treatment worse.</strong> Absence or failure
            of SwornMail must not be treated as worse than a receiver&rsquo;s
            existing default for unattested IPv6. A failed verification
            identifies no accountable party — see{" "}
            <a href="/verify/#semantics" className={LINK}>
              reputation semantics
            </a>
            .
          </li>
          <li>
            <strong>It is not a reputation service.</strong> The protocol
            produces a stable key to keep reputation on. What anyone does with
            that key is outside its scope.
          </li>
        </ul>

        <h2 className={H2} id="where-next">
          Where to go next
        </h2>
        <div className="mt-4 grid gap-x-10 gap-y-5 sm:grid-cols-2">
          <div>
            <h3 className="mb-1 text-[0.9375rem] font-semibold">
              <a href="/deploy/" className={LINK}>
                Deploy as an operator
              </a>
            </h3>
            <p className="text-sm text-muted">
              Generate a key, generate records, publish, verify. Starts in
              observe-only mode by default.
            </p>
          </div>
          <div>
            <h3 className="mb-1 text-[0.9375rem] font-semibold">
              <a href="/records/" className={LINK}>
                DNS records
              </a>
            </h3>
            <p className="text-sm text-muted">
              Every tag, its meaning, whether it is required, and what makes a
              record malformed.
            </p>
          </div>
          <div>
            <h3 className="mb-1 text-[0.9375rem] font-semibold">
              <a href="/verify/" className={LINK}>
                Verification and results
              </a>
            </h3>
            <p className="text-sm text-muted">
              The five result values, what causes each, and the rules a receiver
              must follow when acting on them.
            </p>
          </div>
          <div>
            <h3 className="mb-1 text-[0.9375rem] font-semibold">
              <a href="/implementations/" className={LINK}>
                Implementations
              </a>
            </h3>
            <p className="text-sm text-muted">
              Go reference and CLI, independent Rust verifier, Postfix milter,
              rspamd module, conformance vectors.
            </p>
          </div>
        </div>

        <div className={NOTE}>
          <p className={PROSE}>
            <strong>The draft is normative; this site is not.</strong> These
            pages exist to be read quickly. Where they and{" "}
            <a href="https://github.com/swornmail/spec" className={LINK}>
              the Internet-Draft
            </a>{" "}
            disagree, the draft is correct and the page is a bug —{" "}
            <a
              href="https://github.com/swornmail/spec/issues"
              className={LINK}
            >
              please report it
            </a>
            .
          </p>
        </div>
      </DocShell>
      <Footer />
    </>
  );
}
