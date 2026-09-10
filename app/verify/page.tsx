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
  pageMetadata,
} from "../site-chrome";
import type { Metadata } from "next";

// Single source for this page's title and description: `metadata` and the
// TechArticle schema both read it, so they cannot drift apart.
const PAGE = {
  path: "/verify/",
  title: "Verification and results — SwornMail documentation",
  description:
    "The five SwornMail result values, what causes each, and the rules a receiver must follow when acting on them.",
};

export const metadata: Metadata = pageMetadata(PAGE);

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
              No <C>v=SWORN1</C> policy or key record, NXDOMAIN, an
              unimplemented <C>k=</C>, or — in Mode 1 — no confirming operator
              found.
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
              Malformed token or record, unauthorised token prefix, policy and
              token unit mismatch, bad headers, non-canonical or out-of-range
              prefix, ineligible source, bad unit, bad validity (
              <C>exp &lt;= iat</C>), lifetime over cap, bad role,
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
        <p className={CAPTION}>
          An operator publishing <C>t=y</C> whose checks would all pass is
          reported as <C>none</C>, with <C>policy.testing=y</C> and{" "}
          <C>policy.wouldbe=pass</C>. See{" "}
          <a href="/records/#testing" className={LINK}>
            testing mode
          </a>
          .
        </p>

        <h3 className={H3} id="reporting">
          Reporting the result
        </h3>
        <p className={PROSE}>
          Results are reported with the <C>sworn</C> method in an{" "}
          <C>Authentication-Results</C> field. Every <C>pass</C>, and every{" "}
          <C>t=y</C> observe-only result, carries two prefixes:
        </p>
        <pre className="code-block my-4">
          <code>
            Authentication-Results: mx.example.net;{"\n"}
            {"    "}
            <span className="tok-k">sworn=pass policy.op=mailer.example.com</span>
            {"\n"}
            {"    "}policy.unit=&quot;2001:db8:f00:1200::/56&quot;{"\n"}
            {"    "}
            <span className="tok-k">
              policy.observed=&quot;2001:db8:f00:1234::/64&quot;
            </span>{" "}
            policy.mode=dns
          </code>
        </pre>
        <ul className={`${PROSE} mt-4 list-disc space-y-2 pl-[1.1rem]`}>
          <li>
            <C>policy.unit</C> is the aggregation the operator asked for: a
            claim, taken from its policy record.
          </li>
          <li>
            <C>policy.observed</C> is the connecting address masked to /64:
            what this connection actually corroborated. It comes from the
            connection, never from anything the claimant wrote.
          </li>
        </ul>
        <p className={`${CAPTION} mt-4`}>
          The two are equal at the default <C>u=64</C>. Values containing{" "}
          <C>:</C> or <C>/</C> are quoted. <C>policy.mode</C> is <C>dns</C>{" "}
          for Mode 1 and <C>token</C> for Mode 2.
        </p>

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
          Key reputation on the tuple <C>(operator domain, observed unit)</C>,
          where the observed unit is the connecting address masked to /64.
        </p>
        <div className={NOTE_FLAG}>
          <p className={PROSE}>
            <strong>
              A pass does not prove the operator controls the whole prefix.
            </strong>{" "}
            It proves the connection came from somewhere inside the signed
            prefix. A shared-hosting tenant can publish a policy covering its
            provider&rsquo;s entire aggregate. So unless you hold independent
            evidence of control over the whole attested prefix — a
            reverse-DNS delegation rooted at that boundary, a provider
            authorisation, or applicable authenticated routing evidence —
            scope both credit and blame to the claimant domain and the observed
            /64, or finer. Do not let the claim reach the provider&rsquo;s
            domain, neighbouring /64s, or the aggregate as an IP-only identity.
          </p>
        </div>
        <p className={PROSE}>
          With that evidence, you may use the declared unit up to the boundary
          you verified, and abuse may then affect the operator domain across
          its attested prefixes. A signed broad claim on its own is never that
          evidence: a claimant&rsquo;s <C>u</C> cannot widen the observed unit.
        </p>
        <p className={`${PROSE} mt-4`}>
          Where several valid attestations cover the same source, the most
          specific one decides which applies. A token&rsquo;s <C>role</C> is a
          self-assertion; never grant more favourable treatment on{" "}
          <C>role</C> alone.
        </p>

        <h3 className={H3} id="on-testing">
          On <C>t=y</C> results
        </h3>
        <p className={PROSE}>
          An operator in testing mode has not accepted accountability. Apply no
          reputation consequences in either direction, and never read the
          result as a pass: key on <C>sworn=pass</C>, not on the presence of{" "}
          <C>policy.op</C>.
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
          what makes deploying SwornMail safe for a sender and for a receiver
          to enable.
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

        {/* ---------------------------------------------- dns */}
        <h2 className={H2} id="dns">
          Trust in DNS
        </h2>
        <p className={PROSE}>
          DNS is SwornMail&rsquo;s root of trust. Policy authorisation stops a
          stolen signing key from attesting space the operator never published,
          but it cannot protect an unsigned lookup: an active attacker who can
          replace both the policy and the key answers can impersonate the
          operator.
        </p>
        <p className={`${PROSE} mt-4`}>
          <strong>DNSSEC is recommended.</strong> A verifier that can obtain a
          validated status should expose it to local policy, and
          security-sensitive deployments should require validated answers.
          Without it, SwornMail carries the same DNS-rooted residual risk as
          DKIM. Every link in a delegated CNAME chain is part of this trust
          path.
        </p>
        <p className={CAPTION}>
          Verifiers are also DNS query generators. Syntax checks run before any
          query, cheap checks run first, Mode 1 has a fixed budget, and
          negative caching and per-source rate limits bound the load an attacker
          can aim at a domain of their choosing.
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
          Discovery runs under a hard budget of 10 DNS queries per connection.
          Exhausting it yields <C>temperror</C>, never <C>none</C> — an attacker
          must not be able to convert &ldquo;expensive to answer&rdquo; into
          &ldquo;not attested&rdquo;.
        </p>
        <div className={NOTE}>
          <p className={PROSE}>
            <strong>Mode 1 is experimental in this revision.</strong> It binds a
            prefix to an operator with weaker source authenticity than Mode 2 —
            a BGP hijack of the prefix defeats it — so give it low reputation
            weight until operational experience accrues, and weight Mode 2
            above it. RPKI Route Origin Authorizations covering the attested
            prefixes bound the impact of a hijack.
          </p>
        </div>

        {/* ---------------------------------------------- mode 2 */}
        <h2 className={H2} id="mode2">
          Mode 2: signed token
        </h2>
        <p className={PROSE}>
          A compact COSE_Sign1 token presented with the <C>SWORN</C> SMTP
          command before <C>MAIL FROM</C>, verified statelessly at connection
          time. The checks run in three stages, and the order is part of the
          protocol:
        </p>
        <ol className={`${PROSE} mt-4 list-decimal space-y-2 pl-[1.1rem]`}>
          <li>
            <strong>Local checks, before any DNS.</strong> A tagged COSE_Sign1
            with the required protected headers; a well-formed payload; a
            canonical, in-range prefix; an eligible source address; a validity
            window inside the 24-hour cap, allowing at most 300 seconds of
            clock skew; a legal unit; and the connecting address inside the
            signed prefix.
          </li>
          <li>
            <strong>Policy authorisation.</strong> Fetch{" "}
            <C>_prefixes._sworn.&lt;operator domain&gt;</C>. The token&rsquo;s
            prefix must equal or sit inside one of the policy&rsquo;s first 64
            prefixes, and the token&rsquo;s unit must equal the policy&rsquo;s{" "}
            <C>u</C>. This runs before the key is fetched, so an unauthorised
            token never triggers a key query.
          </li>
          <li>
            <strong>Key and signature.</strong> Fetch{" "}
            <C>&lt;kid&gt;._sworn.&lt;operator domain&gt;</C> and verify with
            the algorithm the record&rsquo;s <C>k=</C> names.
          </li>
        </ol>
        <p className={`${PROSE} mt-4`}>
          No policy record yields <C>none</C>. A malformed policy, an
          unauthorised prefix or a unit mismatch yields <C>permerror</C>.
        </p>
        <div className={NOTE}>
          <p className={PROSE}>
            <strong>A stolen key alone buys little.</strong> It can sign only
            for prefixes the operator&rsquo;s separately published policy
            already authorises, and every token must still be presented from
            inside the prefix it names — replayed from anywhere else it
            produces <C>sworn=fail</C>. Replay from inside the signed prefix
            stays possible for the token&rsquo;s lifetime, so senders should
            keep lifetimes to an hour or less; 24 hours is a hard cap, not a
            target.
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
