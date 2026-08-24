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
  CAPTION,
} from "../site-chrome";

export const metadata = {
  title: "Deploy as an operator — SwornMail documentation",
  description:
    "Generate a signing key, generate your DNS records, publish, and verify. Starts in observe-only mode by default.",
};

export default function Deploy() {
  return (
    <>
      <a
        href="#main"
        className="absolute left-[-9999px] z-10 bg-accent px-4 py-[0.6rem] text-white focus:left-0 focus:top-0"
      >
        Skip to content
      </a>
      <Masthead />
      <DocShell current="/deploy/">
        <p className={LABEL}>Start</p>
        <h1 className="mb-4 text-[2rem] font-semibold leading-tight tracking-[-0.015em]">
          Deploy as an operator
        </h1>
        <p className={LEDE}>
          Three commands and two DNS records. Nothing in your mail software
          changes, and you stake nothing until you decide to.
        </p>

        <div className={NOTE}>
          <p className={PROSE}>
            Output on this page is real, captured by running the CLI. Addresses
            are from the documentation range <C>2001:db8::/32</C>. The only
            edits are truncating one base64 key and eliding a token value.
          </p>
        </div>

        <h2 className={H2} id="install">
          Get the CLI
        </h2>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c">$</span> go install
            github.com/swornmail/swornmail-go/cmd/sworn@latest
          </code>
        </pre>
        <p className={CAPTION}>
          Source:{" "}
          <a href="https://github.com/swornmail/swornmail-go" className={LINK}>
            github.com/swornmail/swornmail-go
          </a>
          .
        </p>

        <h2 className={H2} id="keygen">
          1. Generate a signing key
        </h2>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c">$</span> sworn keygen --selector 2026a
            {"\n\n"}
            selector    2026a{"\n"}
            private key 2026a.key{" "}
            <span className="tok-c">
              (mode 0600 — keep it secret, back it up)
            </span>
            {"\n"}
            public key  gJvTSUnyzNPsehUuIhWlLwPOcCRvbiM+fbCLseUpAf0=
          </code>
        </pre>
        <p className={PROSE}>
          The selector is an arbitrary label that lets you rotate keys without
          downtime — publish a new selector, move traffic to it, then retire the
          old record. <C>keygen</C> refuses to overwrite an existing key without{" "}
          <C>--force</C>.
        </p>

        <h2 className={H2} id="genrecord">
          2. Generate your records
        </h2>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c">$</span> sworn genrecord --domain
            mailer.example.com --selector 2026a \{"\n"}
            {"      "}--key 2026a.key --prefix 2001:db8:f00::/48 --unit 64
            {"\n\n"}
            Publish these records for mailer.example.com.{"\n\n"}
            1. key record — the signing key receivers fetch{"\n"}
            {"   "}zone file:{"\n"}
            {"     "}2026a._sworn.mailer.example.com. 3600 IN TXT{" "}
            <span className="tok-k">
              &quot;v=SWORN1; k=ed25519; pk=gJvTSUn…Af0=&quot;
            </span>
            {"\n\n"}
            2. policy record — the prefixes you stand behind{"\n"}
            {"   "}zone file:{"\n"}
            {"     "}_prefixes._sworn.mailer.example.com. 3600 IN TXT{" "}
            <span className="tok-k">
              &quot;v=SWORN1; p=2001:db8:f00::/48; u=64;{" "}
              <span className="tok-f">t=y</span>&quot;
            </span>
            {"\n\n"}
            notes:{"\n"}
            {"  "}-{" "}
            <span className="tok-f">t=y is set, so this is observe-only</span>:
            receivers report sworn=none policy.testing=y{"\n"}
            {"    "}and stake no reputation on you, for credit or blame.
          </code>
        </pre>
        <p className={PROSE}>
          It also prints a DNS-panel form of each record for providers without
          zone-file editing, and <C>--json</C> for feeding a provider API. Every
          rule on the{" "}
          <a href="/records/" className={LINK}>
            records reference
          </a>{" "}
          is validated before anything is printed, so a mistake surfaces here
          rather than in production.
        </p>

        <div className={NOTE_FLAG}>
          <p className={PROSE}>
            <strong>You start in testing mode whether you ask to or not.</strong>{" "}
            <C>genrecord</C> emits <C>t=y</C> unless you pass{" "}
            <C>--testing=false</C>. Leaving observe-only is a deliberate act.
          </p>
        </div>

        <h2 className={H2} id="publish">
          3. Publish, then check
        </h2>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c">$</span> sworn record mailer.example.com
            --selector 2026a{"\n"}
            <span className="tok-c">$</span> sworn discover --ip
            2001:db8:f00:1234::25
          </code>
        </pre>
        <p className={PROSE}>
          <C>record</C> fetches and lints what you published. <C>discover</C>{" "}
          runs the same Mode 1 discovery a receiver runs, from one of your
          MTA&rsquo;s addresses, and tells you which operator and unit it
          resolves to. Run it from a machine that can resolve public DNS.
        </p>

        <h3 className={H3} id="what-failure-looks-like">
          What failure looks like
        </h3>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c">$</span> sworn verify $TOKEN --ip
            2001:db8:f00:1234::25 --key gJvTSUn…Af0={"\n"}
            <span className="tok-k">
              sworn=pass op=mailer.example.com unit=2001:db8:f00:1234::/64
            </span>
            {"\n"}
            <span className="tok-c">$?</span> 0{"\n\n"}
            <span className="tok-c">
              # the same token, presented from outside the attested prefix
            </span>
            {"\n"}
            <span className="tok-c">$</span> sworn verify $TOKEN --ip
            2001:db8:999::25 --key gJvTSUn…Af0={"\n"}
            <span className="tok-k">sworn=fail reason=off_prefix</span>
            {"\n"}
            <span className="tok-c">$?</span> 1
          </code>
        </pre>
        <p className={CAPTION}>
          Exit codes: <C>0</C> pass · <C>1</C> fail · <C>2</C> permerror or
          usage · <C>3</C> temperror · <C>4</C> none. Scriptable.
        </p>

        <h2 className={H2} id="commit">
          4. When you are ready, accept accountability
        </h2>
        <p className={PROSE}>
          Watch your traffic in testing mode for as long as you like. When the
          results look right, re-run <C>genrecord</C> with{" "}
          <C>--testing=false</C> and publish the updated policy record. That one
          change is the moment the oath is taken, and it is entirely yours to
          make — and to reverse, by republishing <C>t=y</C>.
        </p>

        <h2 className={H2} id="receiving">
          Verifying as a receiver
        </h2>
        <p className={PROSE}>
          If you run inbound mail, see{" "}
          <a href="/implementations/" className={LINK}>
            implementations
          </a>{" "}
          for the Postfix milter and the rspamd module, and{" "}
          <a href="/verify/#semantics" className={LINK}>
            reputation semantics
          </a>{" "}
          for the rules you must follow when acting on a result. The short
          version: never treat a failure as worse than no attestation at all.
        </p>
      </DocShell>
      <Footer />
    </>
  );
}
