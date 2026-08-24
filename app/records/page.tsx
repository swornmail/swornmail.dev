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
} from "../site-chrome";

export const metadata = {
  title: "DNS records — SwornMail documentation",
  description:
    "The SwornMail key record and policy record: every tag, whether it is required, and what makes a record malformed.",
};

export default function Records() {
  return (
    <>
      <a
        href="#main"
        className="absolute left-[-9999px] z-10 bg-accent px-4 py-[0.6rem] text-white focus:left-0 focus:top-0"
      >
        Skip to content
      </a>
      <Masthead />
      <DocShell current="/records/">
        <p className={LABEL}>Reference</p>
        <h1 className="mb-4 text-[2rem] font-semibold leading-tight tracking-[-0.015em]">
          DNS records
        </h1>
        <p className={LEDE}>
          An operator publishes two kinds of record: one <strong>key record</strong>{" "}
          per selector, and one <strong>policy record</strong> for the operator.
          Both are TXT records under the <C>_sworn</C> label.
        </p>

        <div className={NOTE}>
          <p className={PROSE}>
            You do not have to hand-write these. <C>sworn genrecord</C> emits
            both, in zone-file and DNS-panel form, and validates every rule on
            this page before printing anything — see{" "}
            <a href="/deploy/" className={LINK}>
              Deploy as an operator
            </a>
            .
          </p>
        </div>

        {/* ------------------------------------------------ key record */}
        <h2 className={H2} id="key">
          Key record
        </h2>
        <p className={PROSE}>
          Published at a QNAME carrying the selector, so each fetch returns
          exactly one key and rotation never bloats a response.
        </p>
        <pre className="code-block my-4">
          <code>
            2026a._sworn.mailer.example.com. IN TXT{"\n"}
            {"    "}
            <span className="tok-k">
              &quot;v=SWORN1; k=ed25519; pk=&lt;base64&gt;&quot;
            </span>
          </code>
        </pre>

        <Table head={["Tag", "Required", "Meaning"]}>
          <tr>
            <th scope="row">
              <C>v</C>
            </th>
            <td>Required, must be first</td>
            <td>
              Version. Always <C>SWORN1</C>.
            </td>
          </tr>
          <tr>
            <th scope="row">
              <C>k</C>
            </th>
            <td>Required</td>
            <td>
              Algorithm identifier from the SwornMail Algorithm Registry. Initial
              entry: <C>ed25519</C>.
            </td>
          </tr>
          <tr>
            <th scope="row">
              <C>pk</C>
            </th>
            <td>Required</td>
            <td>
              Public key, base64 with padding (RFC 4648 §4).
            </td>
          </tr>
        </Table>
        <p className={CAPTION}>
          The selector appears only in the QNAME. There is no <C>s=</C> tag.
        </p>

        <div className={NOTE_FLAG}>
          <p className={PROSE}>
            <strong>Keys must be dedicated to SwornMail.</strong> A key
            published in a <C>_sworn</C> record must not be reused for any other
            protocol. The token&rsquo;s content-type binding provides additional
            domain separation for signatures.
          </p>
        </div>

        <h3 className={H3} id="unknown-algorithm">
          An algorithm you do not implement is <C>none</C>, never <C>fail</C>
        </h3>
        <p className={PROSE}>
          A record whose <C>k=</C> names an algorithm the verifier does not
          implement must yield <C>sworn=none</C>. This is what lets an operator
          publish a future-algorithm selector alongside a current one without
          being penalised by older verifiers.
        </p>

        {/* ------------------------------------------------ policy record */}
        <h2 className={H2} id="policy">
          Policy record
        </h2>
        <p className={PROSE}>
          Published once per operator. It enumerates the attested prefixes — for
          Mode 1 discovery and for third-party audit — and carries the
          operator-wide policy tags.
        </p>
        <pre className="code-block my-4">
          <code>
            _prefixes._sworn.mailer.example.com. IN TXT{"\n"}
            {"    "}
            <span className="tok-k">
              &quot;v=SWORN1; p=2001:db8:f00::/48,2620:12a:8000::/48; u=64&quot;
            </span>
          </code>
        </pre>

        <Table head={["Tag", "Required", "Meaning"]}>
          <tr>
            <th scope="row">
              <C>v</C>
            </th>
            <td>Required, must be first</td>
            <td>
              Version. Always <C>SWORN1</C>.
            </td>
          </tr>
          <tr>
            <th scope="row">
              <C>p</C>
            </th>
            <td>Required</td>
            <td>
              Comma-separated attested prefixes, each meeting the{" "}
              <a href="#constraints" className={LINK}>
                prefix constraints
              </a>
              . At most 64; verifiers ignore anything beyond the 64th.
            </td>
          </tr>
          <tr>
            <th scope="row">
              <C>u</C>
            </th>
            <td>
              Optional, default <C>64</C>
            </td>
            <td>
              Reputation unit: the prefix length you ask receivers to aggregate
              at. Must be 1–64. A value outside that range makes the record{" "}
              <strong>malformed</strong> rather than being silently clamped, so
              you see the error instead of quietly getting different behaviour
              than you asked for.
            </td>
          </tr>
          <tr>
            <th scope="row">
              <C>t</C>
            </th>
            <td>Optional</td>
            <td>
              Colon-separated flags. <C>y</C> means{" "}
              <a href="#testing" className={LINK}>
                testing mode
              </a>
              .
            </td>
          </tr>
          <tr>
            <th scope="row">
              <C>rua</C>
            </th>
            <td>Optional</td>
            <td>
              Aggregate report destination. <C>mailto:</C> only, with
              DMARC-style external-destination verification.
            </td>
          </tr>
        </Table>
        <p className={CAPTION}>
          <C>u</C>, <C>t</C> and <C>rua</C> apply to both deployment modes.
        </p>

        {/* ------------------------------------------------ testing */}
        <h2 className={H2} id="testing">
          Testing mode
        </h2>
        <p className={PROSE}>
          Publish <C>t=y</C> and receivers report{" "}
          <C>sworn=none policy.testing=y</C>, carrying the would-be result as a
          separate property. You stake no reputation in either direction — not
          credit, not blame — and can watch how your traffic would be classified
          before accepting accountability for anything.
        </p>
        <div className={NOTE_FLAG}>
          <p className={PROSE}>
            <strong>This is enforced, not advisory.</strong> A testing-mode
            operator reported as <C>sworn=pass</C> is a conformance bug: it
            would let a receiver mistake a testing deployment for a committed
            one, which makes the on-ramp a trap. The reference implementations
            treat it as such.
          </p>
        </div>
        <p className={PROSE}>
          <C>sworn genrecord</C> publishes <C>t=y</C> <em>by default</em>. You
          leave testing mode deliberately, by re-running with{" "}
          <C>--testing=false</C>.
        </p>

        {/* ------------------------------------------------ parsing */}
        <h2 className={H2} id="parsing">
          Parsing rules
        </h2>
        <p className={PROSE}>
          These are the rules that decide whether a record is usable at all.
          Most of them exist so that an operator error surfaces as an error
          rather than as a silently different policy.
        </p>
        <ul className={`${PROSE} mt-4 list-disc space-y-2 pl-[1.1rem]`}>
          <li>Tag names are case-sensitive lowercase.</li>
          <li>
            <C>v</C> must be first.
          </li>
          <li>
            A repeated tag name makes the record <strong>malformed</strong>.
          </li>
          <li>Whitespace must not appear within a tag value.</li>
          <li>
            Multiple character-strings in one TXT RR are concatenated in order,
            without separators.
          </li>
          <li>
            If more than one TXT RR at a QNAME begins with <C>v=SWORN1</C>, the
            record set is in error and yields <C>permerror</C>. A verifier must
            not pick one arbitrarily.
          </li>
          <li>
            TXT RRs that do not begin with <C>v=SWORN1</C> are ignored, so
            SwornMail records coexist with everything else at the same name.
          </li>
        </ul>

        {/* ------------------------------------------------ prefixes */}
        <h2 className={H2} id="constraints">
          Prefix constraints
        </h2>
        <p className={PROSE}>
          Every prefix in <C>p=</C> must be canonical — masked, with no host
          bits set — and within the ranges the protocol admits. A non-canonical
          or out-of-range prefix yields <C>permerror</C>; it is not adjusted for
          you.
        </p>
        <p className={`${PROSE} mt-4`}>
          Prefix lengths run from <C>/32</C> to <C>/64</C>. Space outside global
          unicast, and ranges reserved for transition mechanisms, are refused.
        </p>

        {/* ------------------------------------------------ discovery */}
        <h2 className={H2} id="reverse">
          Reverse-tree pointer
        </h2>
        <p className={PROSE}>
          Optional, and only relevant to Mode 1. If you control your reverse
          zone, publishing a pointer there lets a receiver find you directly:
        </p>
        <pre className="code-block my-4">
          <code>
            _sworn.0.0.f.0.8.b.d.0.1.0.0.2.ip6.arpa. IN TXT{"\n"}
            {"    "}
            <span className="tok-k">
              &quot;v=SWORN1; d=mailer.example.com&quot;
            </span>
          </code>
        </pre>
        <p className={PROSE}>
          Without it, discovery falls back to your MTA&rsquo;s
          forward-confirmed PTR. Either way the operator&rsquo;s own policy
          record is fetched and checked; the pointer is a shortcut, not a source
          of authority.
        </p>

        {/* ------------------------------------------------ delegation */}
        <h2 className={H2} id="delegation">
          Delegation
        </h2>
        <p className={PROSE}>
          CNAMEs are permitted at both the <C>&lt;selector&gt;._sworn</C> and{" "}
          <C>_prefixes._sworn</C> labels, so key or prefix management can be
          delegated to a third party — the ESP case.
        </p>
        <div className={NOTE_FLAG}>
          <p className={PROSE}>
            <strong>Delegation transfers real authority.</strong> Pointing{" "}
            <C>&lt;selector&gt;._sworn</C> at a third party gives them the
            ability to sign attestations that bind your domain&rsquo;s
            reputation; pointing <C>_prefixes._sworn</C> at them gives them
            control of which prefixes you appear to stand behind. Remove the
            CNAME when the relationship ends.
          </p>
        </div>
      </DocShell>
      <Footer />
    </>
  );
}
