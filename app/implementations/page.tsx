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
  title: "Implementations — SwornMail documentation",
  description:
    "Go reference and CLI, independent Rust verifier, Postfix milter, rspamd module, and the conformance vectors that hold them together.",
};

export default function Implementations() {
  return (
    <>
      <a
        href="#main"
        className="absolute left-[-9999px] z-10 bg-accent px-4 py-[0.6rem] text-white focus:left-0 focus:top-0"
      >
        Skip to content
      </a>
      <Masthead />
      <DocShell current="/implementations/">
        <p className={LABEL}>Implementations</p>
        <h1 className="mb-4 text-[2rem] font-semibold leading-tight tracking-[-0.015em]">
          Libraries and integrations
        </h1>
        <p className={LEDE}>
          All Apache-2.0, all written by the protocol author. Two independent
          verifiers exist specifically so the wire format is pinned by agreement
          rather than by one codebase&rsquo;s habits.
        </p>

        <Table head={["What", "Language", "Where"]}>
          <tr>
            <th scope="row">Reference library, CLI, milter</th>
            <td>Go</td>
            <td>
              <a href="https://github.com/swornmail/swornmail-go" className={LINK}>
                swornmail/swornmail-go
              </a>
            </td>
          </tr>
          <tr>
            <th scope="row">Independent verifier</th>
            <td>Rust</td>
            <td>
              <a href="https://github.com/swornmail/swornmail" className={LINK}>
                swornmail/swornmail
              </a>{" "}
              ·{" "}
              <a href="https://crates.io/crates/swornmail" className={LINK}>
                crates.io
              </a>
            </td>
          </tr>
          <tr>
            <th scope="row">rspamd module</th>
            <td>Lua</td>
            <td>
              <a
                href="https://github.com/swornmail/rspamd-swornmail"
                className={LINK}
              >
                swornmail/rspamd-swornmail
              </a>
            </td>
          </tr>
          <tr>
            <th scope="row">Draft, threat model, vectors</th>
            <td>—</td>
            <td>
              <a href="https://github.com/swornmail/spec" className={LINK}>
                swornmail/spec
              </a>
            </td>
          </tr>
        </Table>

        <h2 className={H2} id="go">
          Go — reference implementation
        </h2>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c">$</span> go get
            github.com/swornmail/swornmail-go{"\n"}
            <span className="tok-c">$</span> go install
            github.com/swornmail/swornmail-go/cmd/sworn@latest
          </code>
        </pre>
        <p className={PROSE}>
          <C>sworn.Verify</C> checks Mode 2 tokens; <C>sworn/discover</C> runs
          Mode 1 discovery. The resolver is an interface, so both are testable
          without DNS and can be pointed at a validating resolver in production.
        </p>
        <p className={CAPTION}>
          Dependencies are deliberately few: <C>fxamacker/cbor</C>,{" "}
          <C>veraison/go-cose</C>, and <C>emersion/go-milter</C> for the milter.
          Otherwise standard library.
        </p>

        <h3 className={H3} id="milter">
          Postfix milter
        </h3>
        <p className={PROSE}>
          <C>cmd/sworn-milter</C> performs per-connection Mode 1 discovery and
          stamps <C>Authentication-Results</C>. It strips inbound AR fields at
          the trust boundary, and it is <strong>strictly fail-open</strong> — it
          never rejects a message.
        </p>
        <div className={NOTE_FLAG}>
          <p className={PROSE}>
            <strong>A milter cannot carry Mode 2.</strong> Milters run after the
            command phase, so they cannot advertise an EHLO keyword or take an
            SMTP verb. Mode 2 needs an MTA that speaks the extension, or a
            proxy in front. This is a real limitation, not an oversight.
          </p>
        </div>

        <h2 className={H2} id="rust">
          Rust — independent verifier
        </h2>
        <p className={PROSE}>
          Written from the draft rather than ported from the Go code, which is
          the entire point: an implementation derived from another
          implementation cannot detect that the draft is ambiguous. Writing it
          independently surfaced three real draft/implementation contradictions
          before the format was frozen.
        </p>

        <h2 className={H2} id="rspamd">
          Lua — rspamd module
        </h2>
        <p className={PROSE}>
          A self-contained rspamd module, informational by default and
          fail-open. Its protocol logic makes no rspamd calls — the resolver is
          injected — so it runs under plain Lua and can be driven by the
          differential harness.
        </p>

        {/* ------------------------------------------ conformance */}
        <h2 className={H2} id="conformance">
          Conformance
        </h2>
        <p className={PROSE}>
          The <C>-01</C> wire format is frozen. Token bytes, record syntax and
          the conformance vectors are a public contract with shipped
          implementations behind them.
        </p>

        <h3 className={H3} id="vectors">
          Test vectors
        </h3>
        <p className={PROSE}>
          62 vectors — 48 token, 14 record — published at{" "}
          <a
            href="https://github.com/swornmail/spec/tree/main/test-vectors"
            className={LINK}
          >
            spec/test-vectors
          </a>
          . They are authored <em>from the draft</em>, never derived from an
          implementation: a vector generated by the code it is meant to check
          certifies nothing. An earlier round of vectors was circular in exactly
          that way, and rebuilding them found real defects.
        </p>

        <h3 className={H3} id="differentials">
          Differential harnesses
        </h3>
        <p className={PROSE}>
          Two harnesses generate adversarial corpora and run two implementations
          over them, comparing results:
        </p>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c"># tokens: Go vs Rust</span>
            {"\n"}
            <span className="tok-c">$</span> go run ./cmd/difftest --rust
            ../swornmail/target/debug/difftest{"\n\n"}
            <span className="tok-c"># records: Go vs Lua</span>
            {"\n"}
            <span className="tok-c">$</span> go run ./cmd/recorddiff --arm
            ../rspamd-swornmail/test/difftest.sh
          </code>
        </pre>
        <p className={PROSE}>
          Both report <strong>zero divergences</strong>. The token corpus size
          is a parameter — <C>--fuzz</C> defaults to 3000, giving 3,048 cases —
          so the figure is reproducible rather than a marketing number. Run it
          larger; the divergence count should stay at zero. If it does not, that
          is a bug worth reporting.
        </p>
        <div className={NOTE}>
          <p className={PROSE}>
            Both harnesses expect the repositories to be siblings on disk. Clone
            them into one directory.
          </p>
        </div>

        <h2 className={H2} id="writing-one">
          Writing your own
        </h2>
        <p className={PROSE}>
          Start from{" "}
          <a href="https://github.com/swornmail/spec" className={LINK}>
            the draft
          </a>
          , not from this site and not from an existing implementation. Then run
          the vectors. If you disagree with a vector, that is worth an issue —
          it means either the draft is ambiguous or a vector is wrong, and both
          are defects worth fixing before anyone else hits them.
        </p>
      </DocShell>
      <Footer />
    </>
  );
}
