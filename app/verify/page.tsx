import {
  Masthead,
  DocShell,
  Footer,
  Table,
  C,
  H2,
  H3,
  LEDE,
  LINK,
  NOTE,
  NOTE_FLAG,
  PROSE,
  LABEL,
  CAPTION,
  ArticleSchema,
} from "../site-chrome";

// Single source for this page's title and description: `metadata` and the
// TechArticle schema both read it, so they cannot drift apart.
const PAGE = {
  path: "/verify/",
  title: "Verification and results — SwornMail documentation",
  description:
    "The five SwornMail result values, what causes each, and the rules a receiver must follow when acting on them.",
};

export const metadata = {
  title: PAGE.title,
  description: PAGE.description,
  // Overrides the layout's canonical, which would otherwise point every
  // page at the site root.
  alternates: { canonical: PAGE.path },
};

export default function Verify() {
  return (
    <>
      <ArticleSchema {...PAGE} />
      <a
        href="#main"
        className="absolute left-[-9999px] z-10 bg-accent px-4 py-[0.6rem] text-white focus:left-0 focus:top-0"
      >
        Skip to content
      </a>
      <Masthead />
      <DocShell current="/verify/">
        <p className={LABEL}>Reference</p>
        <h1 className="mb-4 text-[2rem] font-semibold leading-tight tracking-[-0.015em]">
          Verification and results
        </h1>
        <p className={LEDE}>
          Verification is stateless and O(1) per connection, with no
          verifier-initiated fetch to attacker-named endpoints beyond DNS.
        </p>

        <h2 className={H2} id="results">
          Result values
        </h2>
        <Table head={["Result", "Cause"]}>
          <tr>
            <th scope="row">
              <C>pass</C>
            </th>
            <td>All verification checks passed.</td>
          </tr>
          <tr>
            <th scope="row">
              <C>none</C>
            </th>
            <td>
              No <C>v=SWORN1</C> record, NXDOMAIN, an unimplemented <C>k=</C>,
              or — in Mode 1 — no confirming operator found.
            </td>
          </tr>
          <tr>
            <th scope="row">
              <C>fail</C>
            </th>
            <td>
              Signature failure, off-prefix, expired, or not yet valid.
            </td>
          </tr>
          <tr>
            <th scope="row">
              <C>permerror</C>
            </th>
            <td>
              Malformed token or record, bad headers, non-canonical or
              out-of-range prefix, ineligible source, bad unit, bad validity
              (<C>exp &lt;= iat</C>), lifetime over cap, bad role,
              non-conforming <C>kid</C> or operator domain, missing required
              key, duplicate key, <C>crit</C> present, or untagged COSE.
            </td>
          </tr>
          <tr>
            <th scope="row">
              <C>temperror</C>
            </th>
            <td>
              DNS timeout or SERVFAIL, or — in Mode 1 — the discovery query
              budget exhausted.
            </td>
          </tr>
        </Table>

        <p className={PROSE}>
          Results are reported in an <C>Authentication-Results</C> field. The{" "}
          <C>policy.mode</C> property is <C>dns</C> for Mode 1 and <C>token</C>{" "}
          for Mode 2.
        </p>
        <pre className="code-block my-4">
          <code>
            Authentication-Results: mx.example.net;{"\n"}
            {"    "}
            <span className="tok-k">sworn=pass policy.op=mailer.example.com</span>
          </code>
        </pre>

        {/* ---------------------------------------------- semantics */}
        <h2 className={H2} id="semantics">
          Reputation semantics
        </h2>
        <p className={PROSE}>
          These are the rules that make the protocol safe to deploy. They are
          the part most likely to be got wrong by an implementer optimising for
          the obvious.
        </p>

        <h3 className={H3} id="on-pass">
          On <C>pass</C>
        </h3>
        <p className={PROSE}>
          Key reputation on the tuple <C>(operator domain, containing unit prefix)</C>.
          Abusive traffic from an attested prefix should affect the reputation
          of that entire attested prefix, and may affect the operator domain
          across all of its attested prefixes. That is the point: the prefix,
          not the address, is the accountable thing.
        </p>

        <h3 className={H3} id="on-failure">
          On <C>fail</C>, <C>temperror</C> and <C>permerror</C>
        </h3>
        <div className={NOTE_FLAG}>
          <p className={PROSE}>
            <strong>
              A failed verification identifies no accountable party.
            </strong>{" "}
            Receivers and reputation services must not attribute a failed result
            to the operator domain named in the token. Anyone can put any domain
            in a token they made up; treating a failure as evidence against that
            domain would make SwornMail a weapon against the operators it exists
            to serve.
          </p>
        </div>
        <p className={PROSE}>
          None of these results may be treated as worse than <C>none</C> for
          reputation or delivery. Absence of attestation must not worsen
          treatment relative to the receiver&rsquo;s existing unattested-IPv6
          policy. This is design goal 1 — <strong>fail-open</strong> — and it is
          what makes deploying SwornMail risk-free for a sender and safe for a
          receiver to enable.
        </p>

        <h3 className={H3} id="temperror-matters">
          Why <C>temperror</C> is not <C>none</C>
        </h3>
        <p className={PROSE}>
          A DNS timeout means the question was not answered, not that the answer
          was &ldquo;no attestation&rdquo;. Collapsing the two would let anyone
          who can disrupt DNS erase an operator&rsquo;s standing. Implementations
          must keep them distinct, and reputation services must not record a
          temporary failure as an absence.
        </p>

        {/* ---------------------------------------------- trust boundary */}
        <h2 className={H2} id="trust-boundary">
          The trust boundary
        </h2>
        <div className={NOTE_FLAG}>
          <p className={PROSE}>
            An inbound <C>sworn=</C> result is trivially spoofable — it is just
            a header field. Per RFC 8601 §5, an ADMD border MTA{" "}
            <strong>must</strong> delete or rename any pre-existing{" "}
            <C>Authentication-Results</C> field claiming its own authserv-id.
            A result must not survive the trust boundary unexamined.
          </p>
        </div>
        <p className={CAPTION}>
          The reference Postfix milter strips inbound AR fields at the boundary
          for exactly this reason.
        </p>

        {/* ---------------------------------------------- mode 1 */}
        <h2 className={H2} id="mode1">
          Mode 1: DNS-only discovery
        </h2>
        <p className={PROSE}>
          The receiver has a connecting address and needs to find who, if
          anyone, is accountable for it.
        </p>
        <ol className={`${PROSE} mt-4 list-decimal space-y-2 pl-[1.1rem]`}>
          <li>
            Look for a <a href="/records/#reverse" className={LINK}>reverse-tree
            pointer</a> naming an operator domain. Failing that, take the
            connecting host&rsquo;s forward-confirmed PTR.
          </li>
          <li>
            Fetch that operator&rsquo;s{" "}
            <a href="/records/#policy" className={LINK}>
              policy record
            </a>
            .
          </li>
          <li>
            Confirm the connecting address falls inside one of the prefixes the
            operator actually attested. This containment check is the whole
            anti-squatting mechanism — a claim is worth nothing without it.
          </li>
        </ol>
        <p className={`${PROSE} mt-4`}>
          Discovery runs under a hard query budget. Exhausting it yields{" "}
          <C>temperror</C>, never <C>none</C> — an attacker must not be able to
          convert &ldquo;expensive to answer&rdquo; into &ldquo;not attested&rdquo;.
        </p>

        {/* ---------------------------------------------- mode 2 */}
        <h2 className={H2} id="mode2">
          Mode 2: signed token
        </h2>
        <p className={PROSE}>
          A compact COSE_Sign1 token presented over an SMTP extension, verified
          statelessly at connection time. All checks must pass for{" "}
          <C>sworn=pass</C>: the token is well-formed and tagged, the signature
          verifies against the key named by <C>kid</C> under the operator
          domain, the validity window is sane and within the lifetime cap, and{" "}
          <strong>the connecting address falls inside the attested prefix</strong>.
        </p>
        <div className={NOTE}>
          <p className={PROSE}>
            <strong>A stolen key alone buys nothing.</strong> The attestation is
            bound to the address space it was issued for, so a captured token
            replayed from anywhere else produces <C>sworn=fail</C>. Key
            compromise on its own must not enable off-prefix impersonation —
            that is design goal 4.
          </p>
        </div>
        <p className={PROSE}>
          The algorithm comes from the key record&rsquo;s <C>k=</C> tag, not
          from the token: a verifier must take the expected algorithm from the
          record and reject a token that disagrees, rather than letting the
          token choose how it is checked.
        </p>
      </DocShell>
      <Footer />
    </>
  );
}
