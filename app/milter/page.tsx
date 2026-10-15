import {
  Masthead,
  DocShell,
  Footer,
  Table,
  C,
  H2,
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
  path: "/milter/",
  title: "Receive with Postfix — SwornMail documentation",
  description:
    "Run the reference milter next to Postfix: install it, point Postfix at it, keep it fail-open, and read the results it adds to inbound mail.",
};

export const metadata: Metadata = pageMetadata(PAGE);

export default function Milter() {
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
      <DocShell current="/milter/">
        <p className={LABEL}>Start</p>
        <h1 className="mb-4 text-[2rem] font-semibold leading-tight tracking-[-0.015em]">
          Receive with Postfix
        </h1>
        <p className={LEDE}>
          The reference milter checks the address of every inbound connection
          against Mode 1 DNS records and adds an{" "}
          <C>Authentication-Results</C> field with the result, removing any
          forged ones on the way in. It never rejects, defers or reroutes a
          message.
        </p>

        <div className={NOTE}>
          <p className={PROSE}>
            Output on this page is real. It was captured by running{" "}
            <C>sworn-milter</C> and driving it with a milter client the way
            Postfix does. Addresses are from the documentation ranges, which
            publish no records, so the test connections come back{" "}
            <C>none</C>. The pass example near the end shows the format the
            milter uses.
          </p>
        </div>

        <h2 className={H2} id="install">
          1. Install
        </h2>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c">$</span> go install
            github.com/swornmail/swornmail-go/cmd/sworn-milter@latest
          </code>
        </pre>
        <p className={CAPTION}>
          Needs Go 1.24 or later. Source:{" "}
          <a href="https://github.com/swornmail/swornmail-go" className={LINK}>
            github.com/swornmail/swornmail-go
          </a>
          .
        </p>

        <h2 className={H2} id="run">
          2. Run it
        </h2>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c">$</span> sworn-milter --authserv-id
            mx.example.com{"\n"}
            sworn-milter: listening on tcp:127.0.0.1:10025 (authserv-id
            mx.example.com)
          </code>
        </pre>
        <Table head={["Flag", "Default", "What it does"]}>
          <tr>
            <td className="whitespace-nowrap">
              <C>--listen</C>
            </td>
            <td>
              <C>tcp:127.0.0.1:10025</C>
            </td>
            <td>
              Where Postfix connects. <C>tcp:host:port</C> or{" "}
              <C>unix:/path</C>.
            </td>
          </tr>
          <tr>
            <td className="whitespace-nowrap">
              <C>--authserv-id</C>
            </td>
            <td>the host name</td>
            <td>
              The id stamped on each result. Inbound results claiming it are
              removed, so set it to the id your downstream filters trust.
            </td>
          </tr>
          <tr>
            <td className="whitespace-nowrap">
              <C>--dns-timeout</C>
            </td>
            <td>
              <C>5s</C>
            </td>
            <td>
              Time allowed for the lookups behind one result. Running out gives{" "}
              <C>temperror</C>.
            </td>
          </tr>
        </Table>
        <p className={PROSE}>
          It needs no privileges, no configuration file and no state. Run it
          under your service manager as an ordinary user.
        </p>
        <div className={NOTE_FLAG}>
          <p className={PROSE}>
            <strong>Check that port 10025 is free first.</strong> Content-filter
            setups, amavis among them, often have Postfix listen on{" "}
            <C>127.0.0.1:10025</C> to take filtered mail back.{" "}
            <C>postconf -M | grep 10025</C> shows whether Postfix has a service
            there, and <C>ss -ltn</C> (or <C>lsof -iTCP -sTCP:LISTEN</C> on
            macOS and the BSDs) shows anything else. If it&rsquo;s taken,
            run <C>sworn-milter --listen tcp:127.0.0.1:&lt;free port&gt;</C> and
            use the same port in <C>smtpd_milters</C> below.
          </p>
        </div>

        <h2 className={H2} id="postfix">
          3. Point Postfix at it
        </h2>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c"># /etc/postfix/main.cf</span>
            {"\n"}
            smtpd_milters = {"{"} inet:127.0.0.1:10025,{" "}
            <span className="tok-k">default_action=accept</span> {"}"}
          </code>
        </pre>
        <p className={PROSE}>
          Then <C>postfix reload</C>.
        </p>
        <div className={NOTE_FLAG}>
          <p className={PROSE}>
            <strong>
              <C>default_action=accept</C> is what keeps this fail-open.
            </strong>{" "}
            The milter never refuses mail. Without that setting, a stopped or
            timed-out milter gets the global <C>milter_default_action</C>:{" "}
            <C>tempfail</C>, or <C>shutdown</C> since Postfix 3.11, and either
            one turns it into refused mail. Set inside the braces, it covers
            this milter only, so your other milters keep failing the way they
            do now. Per-milter settings need Postfix 3.0 or later.
            Don&rsquo;t set the global <C>milter_default_action = accept</C>{" "}
            instead: that would also let mail through unscanned whenever a
            virus or spam milter is down.
          </p>
        </div>
        <p className={PROSE}>
          If <C>smtpd_milters</C> is already set, edit that line rather than
          adding a second one. Postfix keeps only the last definition, so a
          second line would replace the milters you already run, DKIM
          signing included. Put this entry first:
        </p>
        <pre className="code-block my-4">
          <code>
            smtpd_milters = {"{"} inet:127.0.0.1:10025, default_action=accept{" "}
            {"}"},{"\n"}
            {"    "}
            <span className="tok-c">&lt;your existing milters&gt;</span>
          </code>
        </pre>
        <p className={PROSE}>
          First, because milters such as OpenDKIM or OpenDMARC may use the same
          authserv-id. Run ahead of them, this one never sees their results, so
          it can&rsquo;t mistake them for inbound ones and remove them.
        </p>
        <p className={CAPTION}>
          This page uses TCP on loopback because it works the same everywhere.
          A <C>unix:</C> socket works too, but if smtpd runs chrooted (check
          the chroot column for <C>smtp</C> in <C>master.cf</C>), Postfix looks
          for an absolute socket path inside the chroot.
        </p>

        <h2 className={H2} id="check">
          4. Check it
        </h2>
        <p className={PROSE}>
          A test message from <C>2001:db8:f00:1234::25</C> arrives carrying a
          forged result under the receiver&rsquo;s id and a genuine one from
          another domain:
        </p>
        <pre className="code-block my-4">
          <code>
            Authentication-Results: mx.example.com 1; sworn=pass
            policy.op=victim.example{"\n"}
            Authentication-Results: other.example; spf=pass
            smtp.mailfrom=sender.example
          </code>
        </pre>
        <p className={PROSE}>After the milter:</p>
        <pre className="code-block my-4">
          <code>
            <span className="tok-k">
              Authentication-Results: mx.example.com; sworn=none
            </span>
            {"\n"}
            Authentication-Results: other.example; spf=pass
            smtp.mailfrom=sender.example
          </code>
        </pre>
        <p className={PROSE}>
          The forged field is gone, the other domain&rsquo;s result is
          untouched, and the milter&rsquo;s own result is on top. A connection
          over IPv4 gets the same treatment and always <C>sworn=none</C>: Mode
          1 attests IPv6 space only.
        </p>
        <p className={`${PROSE} mt-4`}>
          To see what the milter will say about a sender before any mail
          arrives, run the same discovery with the CLI from the{" "}
          <a href="/deploy/#install" className={LINK}>
            deploy guide
          </a>
          :
        </p>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c">$</span> sworn discover --ip
            2001:db8:f00:1234::25{"\n"}
            sworn=none
          </code>
        </pre>

        <h2 className={H2} id="results">
          What the results mean
        </h2>
        <Table head={["Result", "Meaning"]}>
          <tr>
            <td>
              <C>sworn=pass</C>
            </td>
            <td>
              The address is inside a prefix the operator publishes, and the
              operator has accepted accountability for it.
            </td>
          </tr>
          <tr>
            <td>
              <C>sworn=none policy.testing=y policy.wouldbe=pass</C>
            </td>
            <td>
              Same, but the operator is still in observe-only mode. Stake
              nothing on it, for credit or blame.
            </td>
          </tr>
          <tr>
            <td>
              <C>sworn=none</C>
            </td>
            <td>No operator confirms this address, or it is IPv4.</td>
          </tr>
          <tr>
            <td>
              <C>sworn=temperror</C>
            </td>
            <td>
              DNS failed, ran out of time, or the lookup limit was reached.
              Treat it like <C>none</C>, never as worse.
            </td>
          </tr>
        </Table>
        <p className={PROSE}>A pass carries the details:</p>
        <pre className="code-block my-4">
          <code>
            Authentication-Results: mx.example.com; sworn=pass
            policy.mode=dns{"\n"}
            {"    "}policy.op=mailer.example.com
            policy.unit=&quot;2001:db8:f00:1234::/64&quot;{"\n"}
            {"    "}
            <span className="tok-k">
              policy.observed=&quot;2001:db8:f00:1234::/64&quot;
            </span>
          </code>
        </pre>
        <p className={PROSE}>
          Key reputation on <C>policy.op</C> and <C>policy.observed</C>, the /64
          this connection actually came from. <C>policy.unit</C> is what the
          operator asked for, which is a claim. The full rules are in{" "}
          <a href="/verify/#semantics" className={LINK}>
            reputation semantics
          </a>
          .
        </p>

        <h2 className={H2} id="border">
          Where it has to run
        </h2>
        <p className={PROSE}>
          On the border MTA, the one that accepts connections from the
          Internet. The milter judges the address Postfix reports, so it must
          be the sender&rsquo;s. Behind a load balancer or proxy, have Postfix
          take the real client address from it (for example{" "}
          <C>smtpd_upstream_proxy_protocol = haproxy</C>); otherwise every
          connection is judged as the balancer&rsquo;s address. Only do that on
          a listener that nothing but the proxy can reach: anyone else who can
          connect to it can claim any address, including one inside an
          attested prefix, and get a pass.
        </p>

        <h2 className={H2} id="forged">
          Forged results
        </h2>
        <p className={PROSE}>
          Anyone can write an <C>Authentication-Results</C> field, so the
          milter removes every inbound one that could be read as claiming your
          authserv-id (see{" "}
          <a href="/verify/#trust-boundary" className={LINK}>
            the trust boundary
          </a>
          ). The match is deliberately loose: case, a trailing dot, odd
          whitespace and comments don&rsquo;t hide a forgery, and any field
          containing a MIME encoded-word is removed outright. Removing a field
          it didn&rsquo;t need to is harmless; keeping a forged one is not.
        </p>
        <div className={NOTE_FLAG}>
          <p className={PROSE}>
            <strong>Removing forged results fails open too.</strong> While the
            milter is down, mail is accepted with no <C>sworn</C> result and
            with any inbound field claiming your id left in place. A
            downstream filter that trusts that id sees whatever the sender
            wrote until the milter is back.
          </p>
        </div>

        <h2 className={H2} id="dns">
          DNS
        </h2>
        <p className={PROSE}>
          The milter uses the host&rsquo;s resolver and makes at most ten
          lookups per result. Point the host at a validating resolver if you
          can: an unsigned answer can be spoofed, and DNS is the root of trust
          (see{" "}
          <a href="/verify/#dns" className={LINK}>
            trust in DNS
          </a>
          ). A lookup that times out or fails outright (a SERVFAIL, say), or
          reaching the limit, gives <C>temperror</C>, never <C>none</C>, so a
          sender&rsquo;s attestation can&rsquo;t be erased by breaking their
          DNS. A record that simply isn&rsquo;t there gives <C>none</C>.
        </p>

        <h2 className={H2} id="limits">
          What it doesn&rsquo;t do
        </h2>
        <p className={PROSE}>
          It doesn&rsquo;t score or filter. It adds a result, and acting on it
          is up to whatever reads the header next: your content filter, or the{" "}
          <a href="/implementations/#rspamd" className={LINK}>
            rspamd module
          </a>{" "}
          if you would rather run the check there. It also can&rsquo;t verify
          Mode 2 tokens: a milter sees the SMTP conversation but can&rsquo;t
          extend it with an EHLO keyword or a new command (see{" "}
          <a href="/implementations/#milter" className={LINK}>
            implementations
          </a>
          ).
        </p>
      </DocShell>
      <Footer />
    </>
  );
}
