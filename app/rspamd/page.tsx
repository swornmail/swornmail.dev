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
  path: "/rspamd/",
  title: "Receive with rspamd — SwornMail documentation",
  description:
    "Add the SwornMail module to rspamd: install it, turn it on, make sure forged results are removed, and read the symbols and results it adds to inbound mail.",
};

export const metadata: Metadata = pageMetadata(PAGE);

export default function Rspamd() {
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
      <DocShell current="/rspamd/">
        <p className={LABEL}>Start</p>
        <h1 className="mb-4 text-[2rem] font-semibold leading-tight tracking-[-0.015em]">
          Receive with rspamd
        </h1>
        <p className={LEDE}>
          The rspamd module checks the address of every inbound IPv6
          connection against Mode 1 DNS records, reports the result as a
          symbol, and adds an <C>Authentication-Results</C> field. Every symbol
          scores zero until you decide otherwise, and it never rejects mail.
        </p>

        <div className={NOTE}>
          <p className={PROSE}>
            Output on this page is real. It was captured from rspamd 4.2.2
            running the module behind Postfix 3.10.13, with a test resolver
            serving records planted for documentation addresses. Those
            addresses have no records in public DNS, so on your own server
            they come back <C>none</C>. Long header lines are folded to fit.
          </p>
        </div>
        <p className={PROSE}>
          This page assumes rspamd already filters your mail as a Postfix
          milter, through its proxy worker. If you don&rsquo;t run rspamd and
          want only the check, the{" "}
          <a href="/milter/" className={LINK}>
            Postfix milter
          </a>{" "}
          does it with no configuration file.
        </p>

        <h2 className={H2} id="install">
          1. Install
        </h2>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c">$</span> git clone
            https://github.com/swornmail/rspamd-swornmail{"\n"}
            <span className="tok-c">$</span> cd rspamd-swornmail{"\n"}
            <span className="tok-c">$</span> install -d /etc/rspamd/plugins.d
            /etc/rspamd/lua/sworn{"\n"}
            <span className="tok-c">$</span> install -m 0644 swornmail.lua
            /etc/rspamd/plugins.d/swornmail.lua{"\n"}
            <span className="tok-c">$</span> install -m 0644 lua/sworn/*.lua
            /etc/rspamd/lua/sworn/
          </code>
        </pre>
        <p className={CAPTION}>
          Needs rspamd 3.x or later. Source:{" "}
          <a
            href="https://github.com/swornmail/rspamd-swornmail"
            className={LINK}
          >
            github.com/swornmail/rspamd-swornmail
          </a>
          .
        </p>

        <h2 className={H2} id="enable">
          2. Turn it on
        </h2>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c"># /etc/rspamd/rspamd.conf.local</span>
            {"\n"}
            {"swornmail {\n"}
            {'  enabled = true;\n'}
            {'  lib_path = "/etc/rspamd/lua";\n'}
            {"}"}
          </code>
        </pre>
        <p className={PROSE}>
          It goes in <C>rspamd.conf.local</C>, not{" "}
          <C>local.d/swornmail.conf</C>. rspamd reads <C>local.d</C> files only
          for modules that ship their own defaults, which a third-party module
          doesn&rsquo;t, and it disables a Lua module with no config section.
        </p>
        <Table head={["Setting", "Default", "What it does"]}>
          <tr>
            <td className="whitespace-nowrap">
              <C>authserv_id</C>
            </td>
            <td>rspamd&rsquo;s host name</td>
            <td>
              The id stamped on each <C>sworn</C> result. If rspamd runs on a
              different machine from Postfix, set it to Postfix&rsquo;s name:
              rspamd&rsquo;s own field takes the MTA&rsquo;s name, and the two
              results would otherwise carry different ids.
            </td>
          </tr>
          <tr>
            <td className="whitespace-nowrap">
              <C>use_mta_hostname</C>
            </td>
            <td>
              <C>true</C>
            </td>
            <td>
              Use the client host name Postfix has already confirmed instead of
              looking it up again. Set it to <C>false</C> if rspamd gets mail
              from something whose reverse DNS check you don&rsquo;t trust.
            </td>
          </tr>
          <tr>
            <td className="whitespace-nowrap">
              <C>lib_path</C>
            </td>
            <td>
              <C>/etc/rspamd/lua</C>
            </td>
            <td>
              Where <C>lua/sworn/</C> was installed.
            </td>
          </tr>
        </Table>

        <h2 className={H2} id="forged">
          3. Remove forged results
        </h2>
        <p className={PROSE}>
          Anyone can write <C>Authentication-Results: mx.example.com;
          sworn=pass</C> into a message, so a forged field claiming your id
          must be removed before anything downstream reads it (see{" "}
          <a href="/verify/#trust-boundary" className={LINK}>
            the trust boundary
          </a>
          ). The module adds its result but removes nothing. That job belongs
          to rspamd&rsquo;s <C>milter_headers</C> module, and rspamd&rsquo;s
          stock config doesn&rsquo;t do it.
        </p>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c">
              # /etc/rspamd/local.d/milter_headers.conf
            </span>
            {"\n"}
            {'use = ["authentication-results"];\n'}
            {'authenticated_headers = ["authentication-results"];\n'}
            {'local_headers = ["authentication-results"];\n\n'}
            {"routines {\n"}
            {"  authentication-results {\n"}
            {"    add_smtp_user = false;\n"}
            {"  }\n"}
            {"}"}
          </code>
        </pre>
        <p className={CAPTION}>
          The same settings as <C>conf/milter_headers.conf</C> in the
          repository, which explains each one. If you already have this file,
          merge them into it.
        </p>
        <Table head={["Setting", "Why"]}>
          <tr>
            <td className="whitespace-nowrap">
              <C>use</C>
            </td>
            <td>
              Turns on the routine that deletes every inbound{" "}
              <C>Authentication-Results</C> field, then adds rspamd&rsquo;s own
              SPF, DKIM and DMARC result.
            </td>
          </tr>
          <tr>
            <td className="whitespace-nowrap">
              <C>authenticated_headers</C>
            </td>
            <td>
              The routine skips authenticated senders unless told otherwise.
              Without this, anyone with a stolen password can send your users a
              forged <C>sworn=pass</C>.
            </td>
          </tr>
          <tr>
            <td className="whitespace-nowrap">
              <C>local_headers</C>
            </td>
            <td>
              It also skips private and loopback addresses. Behind a proxy or
              NAT, that&rsquo;s every connection.
            </td>
          </tr>
          <tr>
            <td className="whitespace-nowrap">
              <C>add_smtp_user = false</C>
            </td>
            <td>
              Covering authenticated senders also puts rspamd&rsquo;s field on
              the mail they send out, and by default that field names their
              login. This leaves it out.
            </td>
          </tr>
        </Table>
        <div className={NOTE_FLAG}>
          <p className={PROSE}>
            <strong>Every inbound result goes, not only forged ones.</strong>{" "}
            Unlike the Postfix milter, which removes only fields that could
            claim your id, this deletes other domains&rsquo; results too, and
            any written by an MTA of yours in front of rspamd. For trust, that
            is the safe direction. If something downstream relies on those
            results, it won&rsquo;t see them any more.
          </p>
        </div>
        <div className={NOTE_FLAG}>
          <p className={PROSE}>
            <strong>While rspamd is down, nothing removes them.</strong> If
            Postfix keeps accepting mail when rspamd can&rsquo;t be reached (
            <C>default_action=accept</C> on its milter entry), messages arrive
            with no <C>sworn</C> result and with any forged field claiming your
            id left in place. A downstream filter that trusts that id sees
            whatever the sender wrote until rspamd is back.
          </p>
        </div>
        <p className={PROSE}>
          Don&rsquo;t narrow the deletion with <C>remove_ar_from</C>. It
          recognises a field only by a plain name at its start, so a forged{" "}
          <C>(c) mx.example.com; sworn=pass</C>, or one with the id in quotes,
          gets through.
        </p>

        <h2 className={H2} id="check">
          4. Restart and check
        </h2>
        <p className={PROSE}>After a restart, the rspamd log should have:</p>
        <pre className="code-block my-4">
          <code>
            swornmail: Mode-1 attestation enabled, authserv-id mx.example.com
          </code>
        </pre>
        <p className={PROSE}>
          and nothing starting{" "}
          <C>swornmail: forged sworn= results can reach mailboxes</C>. The
          module reads the <C>milter_headers</C> config at startup and logs
          one of those for each setting that lets a forged result through. On
          rspamd&rsquo;s stock config, without step 3:
        </p>
        <pre className="code-block my-4">
          <code>
            {
              "swornmail: forged sworn= results can reach mailboxes: milter_headers doesn't list authentication-results in use, so forged inbound results are kept"
            }
          </code>
        </pre>
        <p className={CAPTION}>
          The check reads the config file only. Per-message overrides from
          rspamd&rsquo;s settings module can switch the routine off without it
          noticing.
        </p>
        <p className={PROSE}>
          Scan a test message as if it came from a given address:
        </p>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c">$</span>{" "}
            {"printf 'From: a@b.example\\nSubject: t\\n\\nhi\\n' |"}
            {"\n"}
            {"    rspamc --ip=2001:db8:f00:1234::25 symbols | grep SWORN\n"}
            Symbol: SWORN_PASS
            (0.00)[mailer.example.com:2001:db8:f00:1234::/64]
          </code>
        </pre>
        <p className={PROSE}>
          Through Postfix, a message from <C>2001:db8:f00:1234::25</C> arrives
          carrying a forged result under the receiver&rsquo;s id and a genuine
          one from another domain:
        </p>
        <pre className="code-block my-4">
          <code>
            Authentication-Results: mx.example.com; sworn=pass
            policy.op=victim.example{"\n"}
            Authentication-Results: other.example; spf=pass
            smtp.mailfrom=sender.example
          </code>
        </pre>
        <p className={PROSE}>In the mailbox:</p>
        <pre className="code-block my-4">
          <code>
            Authentication-Results: mx.example.com;{"\n"}
            {"    "}dkim=none;{"\n"}
            {"    "}dmarc=none;{"\n"}
            {"    "}spf=none (mx.example.com: domain of a@sender.example has no
            SPF policy{"\n"}
            {"    "}when checking 2001:db8:f00:1234::25)
            smtp.mailfrom=a@sender.example{"\n"}
            <span className="tok-k">
              Authentication-Results: mx.example.com; sworn=pass
              policy.mode=dns{"\n"}
              {"    "}policy.op=mailer.example.com
              policy.unit=&quot;2001:db8:f00:1234::/64&quot;{"\n"}
              {"    "}policy.observed=&quot;2001:db8:f00:1234::/64&quot;
            </span>
          </code>
        </pre>
        <p className={PROSE}>
          Both inbound fields are gone, and rspamd&rsquo;s own result sits
          above the <C>sworn</C> one. A message from a private address went
          the same way: the forged field was removed, and it got no{" "}
          <C>sworn</C> result, because it came over IPv4.
        </p>
        <p className={`${PROSE} mt-4`}>
          To check authenticated senders, ask rspamd directly. A
          zero for <C>Authentication-Results</C> under{" "}
          <C>remove_headers</C> means every inbound field of that name is
          deleted, and the field rspamd adds doesn&rsquo;t name the login:
        </p>
        <pre className="code-block my-4">
          <code>
            <span className="tok-c">$</span>{" "}
            {
              "printf 'Authentication-Results: mx.example.com; sworn=pass\\nFrom: a@b.example\\n\\nhi\\n' |"
            }
            {"\n"}
            {
              "    rspamc --json --ip=2001:db8::1 --user=alice --from=alice@example.com |\n"
            }
            {"    grep -A11 '\"milter\"'"}
          </code>
        </pre>
        <pre className="code-block my-4">
          <code>
            {'    "milter": {\n'}
            {'        "add_headers": {\n'}
            {'            "Authentication-Results": {\n'}
            {'                "order": 1,\n'}
            {
              '                "value": "mx.example.com;\\n\\tauth=pass smtp.mailfrom=alice@example.com"\n'
            }
            {"            }\n"}
            {"        },\n"}
            {'        "remove_headers": {\n'}
            {'            "X-Spam": 0,\n'}
            <span className="tok-k">
              {'            "Authentication-Results": 0\n'}
            </span>
            {"        }\n"}
            {"    },"}
          </code>
        </pre>

        <h2 className={H2} id="results">
          What the results mean
        </h2>
        <Table head={["Symbol", "Result", "Meaning"]}>
          <tr>
            <td>
              <C>SWORN_PASS</C>
            </td>
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
              <C>SWORN_TESTING</C>
            </td>
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
              <C>SWORN_NONE</C>
            </td>
            <td>
              <C>sworn=none</C>
            </td>
            <td>No operator confirms this address.</td>
          </tr>
          <tr>
            <td>
              <C>SWORN_TEMPERROR</C>
            </td>
            <td>
              <C>sworn=temperror</C>
            </td>
            <td>
              DNS failed, ran out of time, or the lookup limit was reached.
              Treat it like <C>none</C>, never as worse.
            </td>
          </tr>
        </Table>
        <p className={PROSE}>
          An IPv4 connection gets no symbol and no <C>sworn</C> result at all:
          Mode 1 attests IPv6 space only. A pass names the operator and both
          prefixes, as in the mailbox example above. Key reputation on{" "}
          <C>policy.op</C> and <C>policy.observed</C>, the /64 this connection
          actually came from. <C>policy.unit</C> is what the operator asked
          for, which is a claim. The full rules are in{" "}
          <a href="/verify/#semantics" className={LINK}>
            reputation semantics
          </a>
          .
        </p>
        <p className={`${PROSE} mt-4`}>
          Authenticated senders, and senders on private or loopback IPv6
          addresses, still get a symbol but no <C>sworn</C> field: that mail
          isn&rsquo;t arriving from another domain&rsquo;s network.
        </p>

        <h2 className={H2} id="scores">
          Scores
        </h2>
        <p className={PROSE}>
          All four symbols score <C>0.0</C>, so installing the module changes
          no verdict. Leave it that way unless you have a reason. A pass says
          who is accountable for the address, not that the mail is any good,
          so it earns nothing on its own. Use it as the key for reputation you
          build from the mail itself. Never score <C>SWORN_NONE</C> or{" "}
          <C>SWORN_TEMPERROR</C> as worse than no result: missing or failed
          attestation must not make treatment worse than it is for IPv6 mail
          today.
        </p>

        <h2 className={H2} id="border">
          Where it has to run
        </h2>
        <p className={PROSE}>
          On the border MTA, the one that accepts connections from the
          Internet. The module judges the address Postfix hands rspamd, so it
          must be the sender&rsquo;s. Behind a load balancer or proxy, have
          Postfix take the real client address from it (for example{" "}
          <C>smtpd_upstream_proxy_protocol = haproxy</C>). Otherwise every
          connection is judged as the balancer&rsquo;s address, and if that
          address is private, rspamd treats every message as local. Only do
          this on a listener that nothing but the proxy can reach: anyone else
          who can connect to it can claim any address, including one inside
          an attested prefix, and get a pass.
        </p>

        <h2 className={H2} id="dns">
          DNS
        </h2>
        <p className={PROSE}>
          The module uses rspamd&rsquo;s resolver and makes at most ten
          lookups per message. Point rspamd at a validating resolver if you
          can: the module doesn&rsquo;t check DNSSEC itself, an unsigned answer
          can be spoofed, and DNS is the root of trust (see{" "}
          <a href="/verify/#dns" className={LINK}>
            trust in DNS
          </a>
          ). A lookup that times out or fails outright, or reaching the limit,
          gives <C>temperror</C>, never <C>none</C>, so a sender&rsquo;s
          attestation can&rsquo;t be erased by breaking their DNS. A record
          that simply isn&rsquo;t there gives <C>none</C>.
        </p>

        <h2 className={H2} id="limits">
          What it doesn&rsquo;t do
        </h2>
        <p className={PROSE}>
          It doesn&rsquo;t change what happens to mail while rspamd is down.
          That is whatever your existing Postfix entry for rspamd&rsquo;s
          milter says. It also can&rsquo;t verify Mode 2 tokens: rspamd sees
          the SMTP conversation through the milter protocol and can&rsquo;t
          extend it (see{" "}
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
