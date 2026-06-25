// Penetration testing methodology reference.
// Curated, phase-by-phase playbooks to structure engagements and report scoping.
// Covers web (OWASP WSTG), Windows & Linux internal (PTES + MITRE ATT&CK), mobile
// (OWASP MASVS/MASTG), wireless (802.11) and red team operations (ATT&CK kill-chain).
// Each check is tagged to the relevant standard. Checks are a representative selection
// of the highest-value tests per phase — authoritative guidance lives at each linked source.

export type MethodCheck = {
  id: string; // canonical reference code: WSTG-xxx (web) or a phase code (internal)
  title: string;
  desc: string;
  tools?: string[]; // suggested tooling / commands
  tags?: string[]; // standards mapping: ATT&CK technique IDs, CWE, OWASP refs
};

export type MethodPhase = {
  id: string;
  num: string; // zero-padded order, e.g. "01"
  title: string;
  tag: string; // phase label, e.g. "WSTG-INFO" or "ATT&CK · Discovery"
  summary: string;
  checks: MethodCheck[];
};

export type Methodology = {
  id: string;
  label: string;
  blurb: string;
  sourceLabel: string;
  sourceUrl: string;
  tagLabel: string; // what the per-check `tags` represent
  subLabel: string; // short tab subtitle, e.g. "OWASP WSTG"
  phases: MethodPhase[];
};

/* ============================ WEB APPLICATION (OWASP WSTG) ============================ */

const WEB: Methodology = {
  id: "web",
  label: "Web Application",
  blurb:
    "Web application penetration testing aligned to the OWASP Web Security Testing Guide (WSTG v4.2). Work top-down through the phases; each WSTG code maps directly to a reportable control.",
  sourceLabel: "owasp.org/wstg",
  sourceUrl: "https://owasp.org/www-project-web-security-testing-guide/",
  tagLabel: "Maps to",
  subLabel: "OWASP WSTG",
  phases: [
    {
      id: "info",
      num: "01",
      title: "Information Gathering",
      tag: "WSTG-INFO",
      summary:
        "Passively and actively profile the target — surface, technology, entry points and architecture — before touching anything intrusive.",
      checks: [
        { id: "WSTG-INFO-01", title: "Search engine / OSINT reconnaissance", desc: "Use search operators, cached pages and code search to surface leaked endpoints, credentials, internal hostnames and documents.", tools: ["Google dorks", "GitHub search", "Wayback Machine", "theHarvester"], tags: ["OSINT"] },
        { id: "WSTG-INFO-02", title: "Fingerprint web server", desc: "Identify the web server product and version from banners, headers and quirks to drive version-specific testing.", tools: ["whatweb", "nmap -sV", "curl -I", "Wappalyzer"], tags: ["CWE-200"] },
        { id: "WSTG-INFO-03", title: "Review metafiles for leakage", desc: "Inspect robots.txt, sitemap.xml, security.txt and humans.txt for disallowed paths and hidden functionality.", tools: ["curl", "browser"], tags: ["CWE-200"] },
        { id: "WSTG-INFO-04", title: "Enumerate applications on the server", desc: "Find virtual hosts, non-standard ports and sibling apps sharing the host or IP.", tools: ["nmap", "ffuf -H 'Host:'", "dnsx", "amass"], tags: ["CWE-200"] },
        { id: "WSTG-INFO-05", title: "Review page content for leakage", desc: "Inspect HTML comments, JS source maps, bundled API keys and metadata for sensitive information.", tools: ["Burp", "browser devtools", "LinkFinder"], tags: ["CWE-615"] },
        { id: "WSTG-INFO-06", title: "Identify application entry points", desc: "Catalogue every request, parameter, header and cookie that influences server behaviour — the attack surface map.", tools: ["Burp Suite", "OWASP ZAP"], tags: ["Attack surface"] },
        { id: "WSTG-INFO-08", title: "Fingerprint app framework", desc: "Detect framework/CMS and version (cookies, headers, paths, error pages) to target known issues and defaults.", tools: ["whatweb", "Wappalyzer", "retire.js"], tags: ["A06:2021"] },
        { id: "WSTG-INFO-10", title: "Map application architecture", desc: "Diagram tiers, WAF/CDN, load balancers, APIs and third-party integrations to understand trust boundaries.", tools: ["Burp", "nmap", "wafw00f"], tags: ["Architecture"] },
      ],
    },
    {
      id: "conf",
      num: "02",
      title: "Configuration & Deployment Management",
      tag: "WSTG-CONF",
      summary: "Test the platform, infrastructure and deployment hygiene around the application.",
      checks: [
        { id: "WSTG-CONF-01", title: "Network/infra configuration", desc: "Check for exposed admin services, default ports and insecure infrastructure components.", tools: ["nmap", "nikto"], tags: ["A05:2021"] },
        { id: "WSTG-CONF-02", title: "Application platform configuration", desc: "Look for sample/default files, verbose tomcat/IIS/Apache configs and debug features left enabled.", tools: ["nikto", "dirsearch"], tags: ["A05:2021", "CWE-16"] },
        { id: "WSTG-CONF-04", title: "Backup & unreferenced files", desc: "Hunt for .bak, .old, .zip, .git, .svn and editor swap files exposing source or secrets.", tools: ["ffuf", "dirsearch", "git-dumper"], tags: ["CWE-530"] },
        { id: "WSTG-CONF-05", title: "Admin interface enumeration", desc: "Locate and test access controls on admin consoles, dashboards and management endpoints.", tools: ["ffuf", "dirsearch"], tags: ["CWE-419"] },
        { id: "WSTG-CONF-06", title: "Test HTTP methods", desc: "Check for dangerous verbs (PUT, DELETE, TRACE) and HTTP method-based access control bypass.", tools: ["curl -X", "nmap http-methods"], tags: ["CWE-650"] },
        { id: "WSTG-CONF-07", title: "HTTP Strict Transport Security", desc: "Verify HSTS is present with adequate max-age and includeSubDomains.", tools: ["curl -I", "testssl.sh"], tags: ["CWE-523"] },
        { id: "WSTG-CONF-10", title: "Subdomain takeover", desc: "Identify dangling DNS records pointing to unclaimed cloud resources.", tools: ["subjack", "nuclei", "dnsx"], tags: ["CWE-350"] },
        { id: "WSTG-CONF-11", title: "Cloud storage", desc: "Test for world-readable/writable S3/Azure/GCS buckets referenced by the app.", tools: ["s3scanner", "cloud_enum"], tags: ["CWE-732"] },
      ],
    },
    {
      id: "idnt",
      num: "03",
      title: "Identity Management",
      tag: "WSTG-IDNT",
      summary: "Review how identities are defined, provisioned and named.",
      checks: [
        { id: "WSTG-IDNT-01", title: "Role definitions", desc: "Map the role model and verify least-privilege separation between role tiers.", tags: ["A01:2021"] },
        { id: "WSTG-IDNT-02", title: "Registration process", desc: "Test whether self-registration allows privilege selection, identity spoofing or verification bypass.", tools: ["Burp"], tags: ["CWE-285"] },
        { id: "WSTG-IDNT-04", title: "Account enumeration", desc: "Detect username disclosure via differing responses on login, registration and password reset.", tools: ["Burp Intruder", "ffuf"], tags: ["CWE-204", "A07:2021"] },
        { id: "WSTG-IDNT-05", title: "Weak username policy", desc: "Check for predictable/guessable usernames (e.g. firstname.lastname, sequential IDs).", tags: ["CWE-521"] },
      ],
    },
    {
      id: "athn",
      num: "04",
      title: "Authentication",
      tag: "WSTG-ATHN",
      summary: "Test the strength and integrity of the authentication mechanisms.",
      checks: [
        { id: "WSTG-ATHN-01", title: "Credentials over encrypted channel", desc: "Confirm credentials are never transmitted over cleartext HTTP.", tools: ["Burp", "testssl.sh"], tags: ["CWE-319", "A02:2021"] },
        { id: "WSTG-ATHN-02", title: "Default credentials", desc: "Try vendor defaults and common admin:admin style pairs against login and devices.", tools: ["hydra", "default-cred lists"], tags: ["CWE-1392"] },
        { id: "WSTG-ATHN-03", title: "Weak lockout mechanism", desc: "Verify lockout / rate-limiting prevents online brute force without enabling easy DoS.", tools: ["Burp Intruder"], tags: ["CWE-307", "A07:2021"] },
        { id: "WSTG-ATHN-04", title: "Bypass authentication schema", desc: "Test forced browsing, parameter tampering and SQLi-based auth bypass to reach authenticated pages.", tools: ["Burp"], tags: ["CWE-287"] },
        { id: "WSTG-ATHN-07", title: "Weak password policy", desc: "Assess minimum length, complexity and breached-password checks.", tags: ["CWE-521"] },
        { id: "WSTG-ATHN-09", title: "Password reset/change flaws", desc: "Test reset token predictability, host-header poisoning, token reuse and lack of old-password checks.", tools: ["Burp"], tags: ["CWE-640"] },
        { id: "WSTG-ATHN-10", title: "Weaker auth in alternative channels", desc: "Compare web vs mobile/API/legacy endpoints for inconsistent MFA or weaker auth.", tags: ["A07:2021"] },
      ],
    },
    {
      id: "athz",
      num: "05",
      title: "Authorization",
      tag: "WSTG-ATHZ",
      summary: "Verify access controls enforce what each identity is permitted to do.",
      checks: [
        { id: "WSTG-ATHZ-01", title: "Directory traversal / file include", desc: "Test path traversal and LFI/RFI to read or include unauthorized files.", tools: ["Burp", "ffuf", "LFISuite"], tags: ["CWE-22", "CWE-98"] },
        { id: "WSTG-ATHZ-02", title: "Bypass authorization schema", desc: "Access functions/resources of higher roles via forced browsing or tampering.", tools: ["Burp", "Autorize"], tags: ["CWE-285", "A01:2021"] },
        { id: "WSTG-ATHZ-03", title: "Privilege escalation", desc: "Test vertical (user→admin) and horizontal escalation through role/flag manipulation.", tools: ["Burp Autorize"], tags: ["CWE-269"] },
        { id: "WSTG-ATHZ-04", title: "Insecure direct object references (IDOR)", desc: "Swap object IDs/keys to access other users' data; test sequential and predictable references.", tools: ["Burp", "Autorize"], tags: ["CWE-639", "A01:2021"] },
        { id: "WSTG-ATHZ-05", title: "OAuth / token weaknesses", desc: "Test redirect_uri validation, scope, state/CSRF protection and token leakage in OAuth flows.", tools: ["Burp"], tags: ["CWE-601"] },
      ],
    },
    {
      id: "sess",
      num: "06",
      title: "Session Management",
      tag: "WSTG-SESS",
      summary: "Test how sessions are created, protected, transmitted and terminated.",
      checks: [
        { id: "WSTG-SESS-01", title: "Session management schema", desc: "Analyse session token entropy, predictability and binding to the user.", tools: ["Burp Sequencer"], tags: ["CWE-384"] },
        { id: "WSTG-SESS-02", title: "Cookie attributes", desc: "Verify HttpOnly, Secure, SameSite and appropriate scope/expiry on session cookies.", tools: ["Burp", "browser devtools"], tags: ["CWE-1004", "CWE-614"] },
        { id: "WSTG-SESS-03", title: "Session fixation", desc: "Confirm the session identifier is rotated on authentication.", tools: ["Burp"], tags: ["CWE-384"] },
        { id: "WSTG-SESS-05", title: "Cross-Site Request Forgery (CSRF)", desc: "Test for state-changing actions lacking anti-CSRF tokens or SameSite protection.", tools: ["Burp", "CSRF PoC generator"], tags: ["CWE-352", "A01:2021"] },
        { id: "WSTG-SESS-06", title: "Logout functionality", desc: "Verify logout invalidates the session server-side, not just client-side.", tags: ["CWE-613"] },
        { id: "WSTG-SESS-07", title: "Session timeout", desc: "Confirm idle and absolute timeouts terminate sessions appropriately.", tags: ["CWE-613"] },
      ],
    },
    {
      id: "inpv",
      num: "07",
      title: "Input Validation",
      tag: "WSTG-INPV",
      summary: "The injection-heavy core of the test — every interpreter boundary the app crosses.",
      checks: [
        { id: "WSTG-INPV-01/02", title: "Cross-Site Scripting (reflected & stored)", desc: "Inject script payloads into reflected and persisted contexts; verify output encoding and CSP.", tools: ["Burp", "XSS Hunter", "dalfox"], tags: ["CWE-79", "A03:2021"] },
        { id: "WSTG-INPV-05", title: "SQL Injection", desc: "Test error-based, boolean/time-based blind and UNION SQLi across all parameters.", tools: ["sqlmap", "Burp"], tags: ["CWE-89", "A03:2021"] },
        { id: "WSTG-INPV-11/12", title: "Code & command injection", desc: "Test for OS command and server-side code execution via unsanitized input.", tools: ["Burp", "commix"], tags: ["CWE-78", "CWE-94"] },
        { id: "WSTG-INPV-17", title: "Host header injection", desc: "Manipulate the Host header to poison links, caches and password-reset URLs.", tools: ["Burp"], tags: ["CWE-644"] },
        { id: "WSTG-INPV-18", title: "Server-Side Template Injection (SSTI)", desc: "Inject template syntax (e.g. {{7*7}}) to detect and exploit template engines for RCE.", tools: ["Burp", "tplmap"], tags: ["CWE-1336"] },
        { id: "WSTG-INPV-19", title: "Server-Side Request Forgery (SSRF)", desc: "Coerce the server into requesting attacker-chosen URLs / internal/cloud-metadata endpoints.", tools: ["Burp", "interactsh"], tags: ["CWE-918", "A10:2021"] },
        { id: "WSTG-INPV-07", title: "XML / XXE injection", desc: "Test XML parsers for external entity expansion and injection.", tools: ["Burp"], tags: ["CWE-611"] },
      ],
    },
    {
      id: "errh",
      num: "08",
      title: "Error Handling",
      tag: "WSTG-ERRH",
      summary: "Check whether errors leak implementation detail useful to an attacker.",
      checks: [
        { id: "WSTG-ERRH-01", title: "Improper error handling", desc: "Trigger error states and review for verbose messages disclosing paths, queries or logic.", tools: ["Burp"], tags: ["CWE-209"] },
        { id: "WSTG-ERRH-02", title: "Stack traces", desc: "Force exceptions to surface stack traces revealing frameworks, versions and source paths.", tools: ["Burp"], tags: ["CWE-209", "A05:2021"] },
      ],
    },
    {
      id: "cryp",
      num: "09",
      title: "Cryptography",
      tag: "WSTG-CRYP",
      summary: "Assess transport security and the application's use of cryptography.",
      checks: [
        { id: "WSTG-CRYP-01", title: "Weak transport layer security", desc: "Test for deprecated protocols (SSLv3/TLS 1.0/1.1), weak ciphers and certificate issues.", tools: ["testssl.sh", "sslscan", "nmap ssl-enum-ciphers"], tags: ["CWE-326", "A02:2021"] },
        { id: "WSTG-CRYP-03", title: "Sensitive info over unencrypted channels", desc: "Identify any sensitive data sent over HTTP or other cleartext channels.", tools: ["Burp", "Wireshark"], tags: ["CWE-319"] },
        { id: "WSTG-CRYP-04", title: "Weak encryption", desc: "Look for weak algorithms, ECB mode, hardcoded keys and predictable IVs in app-level crypto.", tags: ["CWE-327", "CWE-329"] },
      ],
    },
    {
      id: "busl",
      num: "10",
      title: "Business Logic",
      tag: "WSTG-BUSL",
      summary: "Abuse the intended workflow — the tests no scanner finds.",
      checks: [
        { id: "WSTG-BUSL-01", title: "Business logic data validation", desc: "Submit logically invalid but syntactically valid data (negative prices, quantity overflow).", tools: ["Burp"], tags: ["CWE-840"] },
        { id: "WSTG-BUSL-03", title: "Integrity checks", desc: "Tamper with client-trusted values (prices, totals, roles) the server fails to re-validate.", tools: ["Burp"], tags: ["CWE-345"] },
        { id: "WSTG-BUSL-06", title: "Circumvention of workflows", desc: "Skip or reorder multi-step processes (checkout, KYC, approval) to reach a privileged state.", tools: ["Burp"], tags: ["CWE-841"] },
        { id: "WSTG-BUSL-09", title: "Upload of malicious files", desc: "Bypass upload filters (extension, MIME, magic bytes) to plant web shells or stored XSS.", tools: ["Burp", "custom payloads"], tags: ["CWE-434"] },
      ],
    },
    {
      id: "clnt",
      num: "11",
      title: "Client-Side",
      tag: "WSTG-CLNT",
      summary: "Test code executing in the browser and cross-origin trust.",
      checks: [
        { id: "WSTG-CLNT-01", title: "DOM-based XSS", desc: "Trace client-side sinks (innerHTML, eval, document.write) fed by attacker-controllable sources.", tools: ["Burp DOM Invader", "browser devtools"], tags: ["CWE-79"] },
        { id: "WSTG-CLNT-04", title: "Client-side URL redirect (open redirect)", desc: "Test redirect parameters for arbitrary off-site or javascript: redirection.", tools: ["Burp"], tags: ["CWE-601"] },
        { id: "WSTG-CLNT-07", title: "Cross-Origin Resource Sharing (CORS)", desc: "Check for overly permissive Access-Control-Allow-Origin with credentials enabled.", tools: ["Burp", "curl"], tags: ["CWE-942"] },
        { id: "WSTG-CLNT-09", title: "Clickjacking", desc: "Verify X-Frame-Options / frame-ancestors prevent UI redressing.", tools: ["clickjacking PoC"], tags: ["CWE-1021"] },
        { id: "WSTG-CLNT-12", title: "Browser storage", desc: "Inspect localStorage/sessionStorage/IndexedDB for tokens and sensitive data.", tools: ["browser devtools"], tags: ["CWE-922"] },
      ],
    },
  ],
};

/* ============================ INTERNAL NETWORK (PTES + AD) ============================ */

const INTERNAL: Methodology = {
  id: "internal",
  label: "Windows Internal Pentesting",
  blurb:
    "Windows / Active Directory internal penetration testing following the PTES execution flow and the AD attack kill-chain. Each phase is tagged with MITRE ATT&CK technique IDs for reporting and detection mapping.",
  sourceLabel: "attack.mitre.org",
  sourceUrl: "https://attack.mitre.org/matrices/enterprise/",
  tagLabel: "ATT&CK",
  subLabel: "PTES · MITRE ATT&CK",
  phases: [
    {
      id: "recon",
      num: "01",
      title: "Recon & Host Discovery",
      tag: "ATT&CK · Discovery",
      summary: "Establish what is alive on the in-scope ranges and which hosts are domain-joined.",
      checks: [
        { id: "INT-01", title: "Live host sweep", desc: "Enumerate reachable hosts across the in-scope subnets quickly, then refine.", tools: ["nmap -sn", "fping", "masscan"], tags: ["T1018"] },
        { id: "INT-02", title: "Passive network listening", desc: "Sniff broadcast/multicast traffic to identify hosts, naming and protocols without active scanning.", tools: ["Wireshark", "tcpdump", "Responder -A (analyze)"], tags: ["T1040"] },
        { id: "INT-03", title: "Locate domain controllers", desc: "Identify DCs and the domain via DNS SRV records and LDAP/Kerberos ports.", tools: ["nslookup -type=SRV _ldap._tcp.dc._msdcs", "nmap -p88,389,636", "nxc smb"], tags: ["T1018", "T1016"] },
      ],
    },
    {
      id: "enum",
      num: "02",
      title: "Service & Share Enumeration",
      tag: "ATT&CK · Discovery",
      summary: "Fingerprint services, enumerate SMB/LDAP and hunt for anonymous/guest access.",
      checks: [
        { id: "INT-04", title: "Port & service scan", desc: "Full TCP service/version scan on discovered hosts to map the attack surface.", tools: ["nmap -sCV -p-", "masscan"], tags: ["T1046"] },
        { id: "INT-05", title: "SMB enumeration", desc: "Enumerate shares, sessions, OS info and signing status; test null/guest access.", tools: ["nxc smb (NetExec)", "enum4linux-ng", "smbclient -L"], tags: ["T1135", "T1018"] },
        { id: "INT-06", title: "LDAP / domain enumeration", desc: "Pull users, groups, computers, password policy and descriptions via LDAP, anonymous where possible.", tools: ["ldapsearch", "windapsearch", "nxc ldap"], tags: ["T1087", "T1069"] },
        { id: "INT-07", title: "Null-session & anonymous checks", desc: "Test RPC/SMB/LDAP for unauthenticated information disclosure.", tools: ["rpcclient -U ''", "enum4linux-ng"], tags: ["T1087.002"] },
        { id: "INT-08", title: "Network share content review", desc: "Spider readable shares for credentials, scripts, configs and sensitive documents.", tools: ["nxc smb --spider", "snaffler", "manspider"], tags: ["T1135", "T1552.001"] },
      ],
    },
    {
      id: "poison",
      num: "03",
      title: "Network Poisoning & Relay",
      tag: "ATT&CK · Credential Access",
      summary: "Abuse name-resolution fallbacks and missing SMB signing to capture and relay credentials.",
      checks: [
        { id: "INT-09", title: "LLMNR / NBT-NS / mDNS poisoning", desc: "Spoof name-resolution responses to capture NetNTLM hashes from broadcasting hosts.", tools: ["Responder", "Inveigh"], tags: ["T1557.001"] },
        { id: "INT-10", title: "NTLM relay", desc: "Relay captured NTLM auth to hosts lacking SMB signing for code exec or LDAP abuse.", tools: ["impacket-ntlmrelayx", "Responder"], tags: ["T1557.001", "T1187"] },
        { id: "INT-11", title: "IPv6 / mitm6 DNS takeover", desc: "Abuse default IPv6 + WPAD to become the network's DNS and relay to LDAP(S)/ADCS.", tools: ["mitm6", "impacket-ntlmrelayx"], tags: ["T1557"] },
        { id: "INT-12", title: "Offline hash cracking", desc: "Crack captured NetNTLMv2 hashes offline to recover plaintext credentials.", tools: ["hashcat -m 5600", "john"], tags: ["T1110.002"] },
      ],
    },
    {
      id: "credaccess",
      num: "04",
      title: "Credential Access (Domain)",
      tag: "ATT&CK · Credential Access",
      summary: "Acquire domain credentials through Kerberos abuse, spraying and unsecured secrets.",
      checks: [
        { id: "INT-13", title: "AS-REP roasting", desc: "Request AS-REPs for accounts with pre-auth disabled and crack the returned hashes offline.", tools: ["impacket-GetNPUsers", "Rubeus", "hashcat -m 18200"], tags: ["T1558.004"] },
        { id: "INT-14", title: "Kerberoasting", desc: "Request service tickets for SPN accounts and crack them offline to recover service passwords.", tools: ["impacket-GetUserSPNs", "Rubeus", "hashcat -m 13100"], tags: ["T1558.003"] },
        { id: "INT-15", title: "Password spraying", desc: "Spray a few likely passwords across all users, respecting lockout policy, to find weak creds.", tools: ["nxc smb -u users -p", "kerbrute passwordspray"], tags: ["T1110.003"] },
        { id: "INT-16", title: "Unsecured credentials hunt", desc: "Search shares, GPP (cpassword), scripts and configs for stored credentials.", tools: ["snaffler", "Get-GPPPassword", "nxc --gpp-password"], tags: ["T1552.001", "T1552.006"] },
      ],
    },
    {
      id: "adenum",
      num: "05",
      title: "Active Directory Mapping",
      tag: "ATT&CK · Discovery",
      summary: "Collect the full directory graph to find attack paths to high-value targets.",
      checks: [
        { id: "INT-17", title: "BloodHound collection", desc: "Ingest sessions, ACLs, group membership and trusts to map shortest paths to Domain Admin.", tools: ["SharpHound", "bloodhound-python", "BloodHound CE"], tags: ["T1069", "T1482"] },
        { id: "INT-18", title: "ACL / delegation review", desc: "Identify dangerous ACLs (GenericAll, WriteDACL) and constrained/unconstrained/RBCD delegation.", tools: ["BloodHound", "PowerView", "impacket-findDelegation"], tags: ["T1484", "T1078"] },
        { id: "INT-19", title: "Domain trust enumeration", desc: "Map intra-forest and inter-forest trusts for cross-domain escalation paths.", tools: ["nltest", "PowerView Get-DomainTrust", "BloodHound"], tags: ["T1482"] },
        { id: "INT-20", title: "ADCS misconfiguration (ESC) audit", desc: "Enumerate certificate templates and CA settings for ESC1–ESC8 escalation paths.", tools: ["Certipy find", "Certify"], tags: ["T1649"] },
      ],
    },
    {
      id: "privesc",
      num: "06",
      title: "Local Privilege Escalation",
      tag: "ATT&CK · Privilege Escalation",
      summary: "Escalate from a foothold to local admin / SYSTEM on a single host.",
      checks: [
        { id: "INT-21", title: "Automated privesc enumeration", desc: "Run host enumeration to surface misconfigs, unquoted paths, weak services and stored secrets.", tools: ["winPEAS", "linPEAS", "PrivescCheck"], tags: ["T1068", "T1078"] },
        { id: "INT-22", title: "Service & scheduled-task abuse", desc: "Exploit weak service perms, unquoted service paths, writable binaries and modifiable tasks.", tools: ["PowerUp", "accesschk"], tags: ["T1543.003", "T1053.005"] },
        { id: "INT-23", title: "Kernel / privilege exploits", desc: "Use missing-patch or token-privilege (SeImpersonate) exploits to reach SYSTEM.", tools: ["Potato suite", "Watson", "linux-exploit-suggester"], tags: ["T1068", "T1134.001"] },
        { id: "INT-24", title: "Credential dumping (local)", desc: "Dump LSASS, SAM and cached/DPAPI secrets once local admin is obtained.", tools: ["mimikatz", "impacket-secretsdump", "nanodump"], tags: ["T1003.001", "T1003.002"] },
      ],
    },
    {
      id: "lateral",
      num: "07",
      title: "Lateral Movement",
      tag: "ATT&CK · Lateral Movement",
      summary: "Reuse credentials and material to pivot across hosts toward the objective.",
      checks: [
        { id: "INT-25", title: "Pass-the-Hash / -Ticket / OverPass", desc: "Authenticate with NTLM hashes or Kerberos tickets instead of plaintext to move laterally.", tools: ["nxc", "impacket-psexec/wmiexec", "Rubeus", "mimikatz"], tags: ["T1550.002", "T1550.003"] },
        { id: "INT-26", title: "Remote execution (SMB/WMI/WinRM)", desc: "Execute commands on remote hosts where credentials are valid.", tools: ["impacket-psexec/wmiexec/smbexec", "evil-winrm", "nxc -x"], tags: ["T1021.002", "T1021.006"] },
        { id: "INT-27", title: "RDP & session hijacking", desc: "Pivot via RDP and hijack/reuse existing interactive sessions and tokens.", tools: ["xfreerdp", "mimikatz ts::", "tscon"], tags: ["T1021.001", "T1563.002"] },
        { id: "INT-28", title: "Credential reuse mapping", desc: "Spray recovered creds/hashes across the estate to find where local admin is reused.", tools: ["nxc smb --local-auth", "nxc smb -H"], tags: ["T1078", "T1550.002"] },
      ],
    },
    {
      id: "domesc",
      num: "08",
      title: "Domain Dominance",
      tag: "ATT&CK · Privilege Escalation",
      summary: "Convert privileged access into control of the domain or forest.",
      checks: [
        { id: "INT-29", title: "DCSync", desc: "Abuse replication rights to pull password hashes (incl. krbtgt) for any account from a DC.", tools: ["impacket-secretsdump -just-dc", "mimikatz lsadump::dcsync"], tags: ["T1003.006"] },
        { id: "INT-30", title: "Golden / Silver tickets", desc: "Forge TGTs (krbtgt) or service tickets for persistent, arbitrary domain access.", tools: ["impacket-ticketer", "mimikatz kerberos::golden"], tags: ["T1558.001", "T1558.002"] },
        { id: "INT-31", title: "ADCS exploitation (ESC1–ESC8)", desc: "Abuse vulnerable certificate templates/CA to obtain certs authenticating as privileged users.", tools: ["Certipy", "Certify", "PetitPotam + ntlmrelayx"], tags: ["T1649"] },
        { id: "INT-32", title: "Coercion + relay to DC", desc: "Coerce DC authentication (PetitPotam/PrinterBug) and relay to ADCS/LDAP for takeover.", tools: ["coercer", "PetitPotam", "impacket-ntlmrelayx"], tags: ["T1187", "T1557"] },
      ],
    },
    {
      id: "persist",
      num: "09",
      title: "Persistence",
      tag: "ATT&CK · Persistence",
      summary: "Establish durable, deniable access (use sparingly and document for cleanup).",
      checks: [
        { id: "INT-33", title: "Account & group manipulation", desc: "Add controlled accounts to privileged groups or reset target passwords for re-entry.", tools: ["net group", "PowerView"], tags: ["T1098", "T1136"] },
        { id: "INT-34", title: "Scheduled tasks / services / autoruns", desc: "Plant a task, service or autostart entry for re-execution on the host.", tools: ["schtasks", "sc create", "Run keys"], tags: ["T1053.005", "T1543.003", "T1547.001"] },
        { id: "INT-35", title: "Kerberos persistence", desc: "Use golden tickets or AdminSDHolder/ACL backdoors for long-lived domain persistence.", tools: ["mimikatz", "PowerView Add-DomainObjectAcl"], tags: ["T1558.001", "T1484"] },
      ],
    },
    {
      id: "report",
      num: "10",
      title: "Exfil Demo, Cleanup & Reporting",
      tag: "ATT&CK · Exfiltration / Impact",
      summary: "Demonstrate impact safely, restore the environment and capture evidence for the report.",
      checks: [
        { id: "INT-36", title: "Controlled impact demonstration", desc: "Prove access to crown-jewel data within scope — do not destroy, encrypt or remove production data.", tags: ["T1005", "T1486"] },
        { id: "INT-37", title: "Artifact cleanup", desc: "Remove planted tools, accounts, tasks, tickets and uploaded files; document anything left for the client.", tags: ["Cleanup"] },
        { id: "INT-38", title: "Evidence & timeline capture", desc: "Record commands, timestamps, hosts touched and screenshots to support findings and de-confliction.", tags: ["Reporting"] },
      ],
    },
  ],
};

/* ============================ LINUX INTERNAL (PTES + ATT&CK) ============================ */

const LINUX: Methodology = {
  id: "linux",
  label: "Linux Internal Pentesting",
  blurb:
    "Internal penetration testing of Linux/Unix hosts and estates following the PTES execution flow, mapped to the MITRE ATT&CK Linux matrix. Covers enumeration, the classic local privilege-escalation paths and pivoting toward the objective.",
  sourceLabel: "attack.mitre.org",
  sourceUrl: "https://attack.mitre.org/matrices/enterprise/linux/",
  tagLabel: "ATT&CK",
  subLabel: "PTES · ATT&CK (Linux)",
  phases: [
    {
      id: "recon",
      num: "01",
      title: "Recon & Host Discovery",
      tag: "ATT&CK · Discovery",
      summary: "Establish what is alive on the in-scope ranges and identify Linux/Unix hosts and their exposed services.",
      checks: [
        { id: "LIN-01", title: "Live host sweep", desc: "Enumerate reachable hosts across the in-scope subnets, then refine to Linux/Unix targets by TTL and fingerprint.", tools: ["nmap -sn", "fping", "masscan"], tags: ["T1018"] },
        { id: "LIN-02", title: "Port & service scan", desc: "Full TCP service/version scan to map the attack surface (SSH, web, NFS, DB, RPC).", tools: ["nmap -sCV -p-", "masscan", "rustscan"], tags: ["T1046"] },
        { id: "LIN-03", title: "OS & service fingerprinting", desc: "Identify distro, kernel and service versions to drive version-specific testing.", tools: ["nmap -O", "whatweb", "banner grabbing"], tags: ["T1592", "T1046"] },
      ],
    },
    {
      id: "enum",
      num: "02",
      title: "Service Enumeration",
      tag: "ATT&CK · Discovery",
      summary: "Enumerate exposed network services for anonymous access, exports and information disclosure.",
      checks: [
        { id: "LIN-04", title: "NFS export enumeration", desc: "List exported shares and test for world-readable / no_root_squash mounts that expose files or enable privesc.", tools: ["showmount -e", "mount -t nfs", "nmap nfs-*"], tags: ["T1135"] },
        { id: "LIN-05", title: "SMB / Samba enumeration", desc: "Enumerate Samba shares and versions; test null/guest access and known Samba CVEs.", tools: ["enum4linux-ng", "smbclient -L", "nxc smb"], tags: ["T1135", "T1083"] },
        { id: "LIN-06", title: "SSH configuration review", desc: "Identify auth methods, banner, allowed users and weak configuration (password auth, root login).", tools: ["nmap ssh-auth-methods", "ssh-audit"], tags: ["T1021.004"] },
        { id: "LIN-07", title: "Web & database services", desc: "Enumerate web apps, admin panels and exposed databases (MySQL/PostgreSQL/Redis/Mongo) for default or missing auth.", tools: ["whatweb", "nmap", "redis-cli", "mysql"], tags: ["T1046", "T1190"] },
        { id: "LIN-08", title: "RPC / NIS / legacy services", desc: "Probe rpcbind, finger, rsync and SNMP for information disclosure.", tools: ["rpcinfo", "snmpwalk", "rsync"], tags: ["T1046"] },
      ],
    },
    {
      id: "access",
      num: "03",
      title: "Initial Access & Exploitation",
      tag: "ATT&CK · Initial Access",
      summary: "Gain a first foothold via vulnerable services, weak credentials or exposed applications.",
      checks: [
        { id: "LIN-09", title: "Vulnerable service exploitation", desc: "Identify and exploit known-vulnerable service versions for remote code execution.", tools: ["searchsploit", "metasploit", "nuclei"], tags: ["T1190"] },
        { id: "LIN-10", title: "Default & weak credentials", desc: "Test default and common credentials against SSH, web and database services.", tools: ["hydra", "nxc ssh", "medusa"], tags: ["T1078.001", "T1110"] },
        { id: "LIN-11", title: "Web-to-shell", desc: "Leverage web vulnerabilities (upload, RCE, SSTI, LFI) to drop a reverse shell on the host.", tools: ["Burp", "weevely", "nc"], tags: ["T1505.003", "T1059.004"] },
      ],
    },
    {
      id: "privesc",
      num: "04",
      title: "Local Privilege Escalation",
      tag: "ATT&CK · Privilege Escalation",
      summary: "Escalate from an unprivileged shell to root through misconfiguration and abuse primitives.",
      checks: [
        { id: "LIN-12", title: "Automated enumeration", desc: "Surface SUID/SGID, writable paths, cron jobs, capabilities and kernel version in one pass.", tools: ["linPEAS", "LinEnum", "lse"], tags: ["T1082", "T1083"] },
        { id: "LIN-13", title: "Sudo misconfiguration abuse", desc: "Review sudo rights and exploit permitted binaries for shell escape via GTFOBins.", tools: ["sudo -l", "GTFOBins"], tags: ["T1548.003"] },
        { id: "LIN-14", title: "SUID/SGID & capabilities abuse", desc: "Find SUID/SGID binaries and file capabilities and abuse them to execute as root.", tools: ["find / -perm -4000", "getcap -r /", "GTFOBins"], tags: ["T1548.001"] },
        { id: "LIN-15", title: "Cron & writable script abuse", desc: "Identify scheduled jobs running scripts in writable paths and hijack them for root execution.", tools: ["pspy", "cat /etc/crontab", "ls -la"], tags: ["T1053.003"] },
        { id: "LIN-16", title: "Kernel & local service exploits", desc: "Use missing-patch kernel or vulnerable local service exploits where config-based paths fail.", tools: ["linux-exploit-suggester", "searchsploit"], tags: ["T1068"] },
      ],
    },
    {
      id: "creds",
      num: "05",
      title: "Credential Access & Hunting",
      tag: "ATT&CK · Credential Access",
      summary: "Harvest credentials and secrets from the host once access is obtained.",
      checks: [
        { id: "LIN-17", title: "Password hash dumping", desc: "Read /etc/shadow once root and crack hashes offline.", tools: ["unshadow", "hashcat -m 1800", "john"], tags: ["T1003.008"] },
        { id: "LIN-18", title: "SSH key & secret hunting", desc: "Search home dirs, configs and app dirs for private keys, tokens and plaintext passwords.", tools: ["find / -name id_rsa", "grep -ri password", "linPEAS"], tags: ["T1552.001", "T1552.004"] },
        { id: "LIN-19", title: "History & config mining", desc: "Inspect .bash_history, env files and dotfiles for credentials and connection strings.", tools: ["cat ~/.bash_history", "env", "grep"], tags: ["T1552.003"] },
      ],
    },
    {
      id: "lateral",
      num: "06",
      title: "Lateral Movement & Pivoting",
      tag: "ATT&CK · Lateral Movement",
      summary: "Reuse harvested material to move to additional hosts and pivot deeper into the network.",
      checks: [
        { id: "LIN-20", title: "SSH key reuse & agent hijack", desc: "Use recovered keys and hijack ssh-agent / known_hosts to authenticate to further hosts.", tools: ["ssh", "ssh-agent", "known_hosts review"], tags: ["T1021.004", "T1563.001"] },
        { id: "LIN-21", title: "Credential reuse mapping", desc: "Spray recovered passwords/keys across the estate to find where access is reused.", tools: ["nxc ssh", "hydra"], tags: ["T1078"] },
        { id: "LIN-22", title: "Tunneling & port forwarding", desc: "Establish pivots through compromised hosts to reach segmented internal networks.", tools: ["chisel", "ssh -J / -L / -D", "sshuttle", "ligolo-ng"], tags: ["T1090", "T1572"] },
      ],
    },
    {
      id: "persist",
      num: "07",
      title: "Persistence",
      tag: "ATT&CK · Persistence",
      summary: "Establish durable access where in scope (use sparingly and document for cleanup).",
      checks: [
        { id: "LIN-23", title: "authorized_keys backdoor", desc: "Add a controlled public key to authorized_keys for re-entry.", tools: ["echo >> ~/.ssh/authorized_keys"], tags: ["T1098.004"] },
        { id: "LIN-24", title: "Cron / systemd persistence", desc: "Plant a cron job, systemd service or timer for re-execution.", tools: ["crontab -e", "systemctl", "systemd timer"], tags: ["T1053.003", "T1543.002"] },
        { id: "LIN-25", title: "Account & sudoers manipulation", desc: "Create a user or add sudoers entries for durable privileged access.", tools: ["useradd", "visudo"], tags: ["T1136.001", "T1098"] },
      ],
    },
    {
      id: "report",
      num: "08",
      title: "Impact Demo, Cleanup & Reporting",
      tag: "ATT&CK · Impact",
      summary: "Demonstrate impact safely, restore the environment and capture evidence for the report.",
      checks: [
        { id: "LIN-26", title: "Controlled impact demonstration", desc: "Prove access to crown-jewel data within scope — do not destroy or remove production data.", tags: ["T1005"] },
        { id: "LIN-27", title: "Artifact cleanup", desc: "Remove planted keys, accounts, cron/systemd units and uploaded tools; document anything left for the client.", tags: ["Cleanup"] },
        { id: "LIN-28", title: "Evidence & timeline capture", desc: "Record commands, timestamps, hosts touched and screenshots to support findings.", tags: ["Reporting"] },
      ],
    },
  ],
};

/* ============================ MOBILE APPLICATION (OWASP MASVS) ============================ */

const MOBILE: Methodology = {
  id: "mobile",
  label: "Mobile Application",
  blurb:
    "Mobile application penetration testing (Android & iOS) aligned to the OWASP Mobile Application Security Verification Standard (MASVS) and testing guide (MASTG). Each phase maps to a MASVS control group.",
  sourceLabel: "mas.owasp.org",
  sourceUrl: "https://mas.owasp.org/",
  tagLabel: "MASVS",
  subLabel: "OWASP MASVS / MASTG",
  phases: [
    {
      id: "recon",
      num: "01",
      title: "Recon & Static Analysis",
      tag: "MASVS-CODE",
      summary: "Obtain the app package, reverse it and review the manifest, configuration and bundled secrets.",
      checks: [
        { id: "MAS-01", title: "Obtain & unpack the app", desc: "Pull the APK/IPA and unpack resources, manifest and compiled code for review.", tools: ["apktool", "adb pull", "frida-ios-dump"], tags: ["MASVS-CODE"] },
        { id: "MAS-02", title: "Decompile & review code", desc: "Decompile to Java/Smali or inspect the iOS binary for logic, endpoints and weaknesses.", tools: ["jadx", "MobSF", "Hopper", "class-dump"], tags: ["MASVS-CODE"] },
        { id: "MAS-03", title: "Manifest / Info.plist review", desc: "Review permissions, exported components, debuggable/allowBackup flags and ATS settings.", tools: ["MobSF", "manifest review"], tags: ["MASVS-PLATFORM"] },
        { id: "MAS-04", title: "Hardcoded secrets", desc: "Search the package for API keys, credentials, endpoints and certificates.", tools: ["MobSF", "grep", "trufflehog"], tags: ["MASVS-STORAGE", "MASVS-CRYPTO"] },
      ],
    },
    {
      id: "storage",
      num: "02",
      title: "Local Data Storage",
      tag: "MASVS-STORAGE",
      summary: "Verify how sensitive data is stored on the device at rest.",
      checks: [
        { id: "MAS-05", title: "Insecure local storage", desc: "Inspect SharedPreferences, plists, SQLite DBs and files for unencrypted sensitive data.", tools: ["objection", "adb", "sqlite3"], tags: ["MASVS-STORAGE"] },
        { id: "MAS-06", title: "Keychain / Keystore usage", desc: "Verify secrets use the platform Keystore/Keychain with appropriate protection classes.", tools: ["objection", "frida"], tags: ["MASVS-STORAGE", "MASVS-CRYPTO"] },
        { id: "MAS-07", title: "Logs, cache & backups", desc: "Check logcat, caches, screenshots and backups for leaked sensitive data.", tools: ["adb logcat", "idb", "MobSF"], tags: ["MASVS-STORAGE"] },
      ],
    },
    {
      id: "crypto",
      num: "03",
      title: "Cryptography",
      tag: "MASVS-CRYPTO",
      summary: "Assess the app's use of cryptography for storage and transport.",
      checks: [
        { id: "MAS-08", title: "Weak / custom crypto", desc: "Identify weak algorithms (DES/ECB/MD5), custom crypto and insecure modes.", tools: ["jadx review", "frida hooks"], tags: ["MASVS-CRYPTO"] },
        { id: "MAS-09", title: "Hardcoded keys & weak randomness", desc: "Find hardcoded keys/IVs and predictable random-number generation.", tools: ["jadx", "MobSF"], tags: ["MASVS-CRYPTO"] },
      ],
    },
    {
      id: "auth",
      num: "04",
      title: "Authentication & Session",
      tag: "MASVS-AUTH",
      summary: "Test authentication, session handling and local authentication controls.",
      checks: [
        { id: "MAS-10", title: "Session & token handling", desc: "Review how session tokens are issued, stored and invalidated; test for weak/long-lived tokens.", tools: ["Burp", "objection"], tags: ["MASVS-AUTH"] },
        { id: "MAS-11", title: "Local / biometric auth bypass", desc: "Attempt to bypass local PIN/biometric checks via runtime instrumentation.", tools: ["objection", "frida"], tags: ["MASVS-AUTH"] },
      ],
    },
    {
      id: "network",
      num: "05",
      title: "Network Communication",
      tag: "MASVS-NETWORK",
      summary: "Intercept and assess the security of network traffic.",
      checks: [
        { id: "MAS-12", title: "Traffic interception", desc: "Proxy app traffic and inspect APIs for sensitive data and server-side issues.", tools: ["Burp", "mitmproxy"], tags: ["MASVS-NETWORK"] },
        { id: "MAS-13", title: "TLS validation & cleartext", desc: "Test for cleartext traffic and improper certificate/hostname validation.", tools: ["Burp", "testssl.sh"], tags: ["MASVS-NETWORK"] },
        { id: "MAS-14", title: "Certificate pinning bypass", desc: "Bypass pinning to confirm whether it is the only control protecting traffic.", tools: ["objection", "frida (unpinning)"], tags: ["MASVS-NETWORK"] },
      ],
    },
    {
      id: "platform",
      num: "06",
      title: "Platform Interaction & IPC",
      tag: "MASVS-PLATFORM",
      summary: "Test exposed platform components, IPC and WebView usage.",
      checks: [
        { id: "MAS-15", title: "Exported component abuse", desc: "Test exported activities, services, broadcast receivers and content providers for unauthorized access.", tools: ["drozer", "adb am/pm"], tags: ["MASVS-PLATFORM"] },
        { id: "MAS-16", title: "Deep link / URL scheme handling", desc: "Abuse deep links and custom URL schemes to reach internal functionality or inject data.", tools: ["adb", "Burp"], tags: ["MASVS-PLATFORM"] },
        { id: "MAS-17", title: "WebView security", desc: "Review JavaScript bridges, file access and loading of untrusted content in WebViews.", tools: ["jadx", "drozer"], tags: ["MASVS-PLATFORM"] },
      ],
    },
    {
      id: "code",
      num: "07",
      title: "Code Quality & Injection",
      tag: "MASVS-CODE",
      summary: "Test injection sinks and code-quality defects reachable from input.",
      checks: [
        { id: "MAS-18", title: "Injection in providers / WebView", desc: "Test SQL injection in content providers and injection in WebView/JS bridges.", tools: ["drozer", "Burp"], tags: ["MASVS-CODE"] },
        { id: "MAS-19", title: "Debuggable & dangerous flags", desc: "Confirm release builds are not debuggable and do not enable insecure debug features.", tools: ["MobSF", "manifest review"], tags: ["MASVS-CODE", "MASVS-RESILIENCE"] },
      ],
    },
    {
      id: "resilience",
      num: "08",
      title: "Resilience & Anti-Tampering",
      tag: "MASVS-RESILIENCE",
      summary: "Assess defences against running on compromised devices and reverse engineering.",
      checks: [
        { id: "MAS-20", title: "Root / jailbreak detection", desc: "Test whether root/jailbreak detection exists and whether it can be bypassed.", tools: ["objection", "frida", "Magisk"], tags: ["MASVS-RESILIENCE"] },
        { id: "MAS-21", title: "Anti-debug & integrity checks", desc: "Evaluate anti-debugging, emulator detection and runtime integrity/repackaging checks.", tools: ["frida", "ptrace tests"], tags: ["MASVS-RESILIENCE"] },
        { id: "MAS-22", title: "Code obfuscation review", desc: "Assess whether sensitive logic is obfuscated to resist static analysis.", tools: ["jadx", "MobSF"], tags: ["MASVS-RESILIENCE"] },
      ],
    },
  ],
};

/* ============================ WIRELESS / WI-FI (802.11) ============================ */

const WIFI: Methodology = {
  id: "wifi",
  label: "Wireless / Wi-Fi",
  blurb:
    "Wireless (802.11) penetration testing covering discovery, WPA2/WPA3 personal and enterprise attacks, WPS and rogue-AP / evil-twin techniques, then pivoting from the wireless layer onto the internal network.",
  sourceLabel: "aircrack-ng.org",
  sourceUrl: "https://www.aircrack-ng.org/doku.php",
  tagLabel: "Technique",
  subLabel: "802.11 · PTES Wireless",
  phases: [
    {
      id: "recon",
      num: "01",
      title: "Recon & Discovery",
      tag: "Wireless · Discovery",
      summary: "Survey the RF environment and map in-scope SSIDs, BSSIDs, channels, encryption and clients.",
      checks: [
        { id: "WIFI-01", title: "Passive survey", desc: "Passively map nearby networks: SSID, BSSID, channel, signal, encryption and connected clients.", tools: ["airodump-ng", "kismet"], tags: ["Discovery"] },
        { id: "WIFI-02", title: "Hidden SSID discovery", desc: "Reveal non-broadcast SSIDs from probe/association frames or targeted deauth.", tools: ["airodump-ng", "mdk4"], tags: ["Discovery"] },
        { id: "WIFI-03", title: "Client & probe enumeration", desc: "Enumerate clients and their probe requests to identify target networks and roaming behaviour.", tools: ["airodump-ng", "Wireshark"], tags: ["Discovery"] },
      ],
    },
    {
      id: "setup",
      num: "02",
      title: "Monitor Mode & Capture Setup",
      tag: "Wireless · Setup",
      summary: "Prepare the adapter and capture pipeline before launching active attacks.",
      checks: [
        { id: "WIFI-04", title: "Enable monitor mode", desc: "Put the wireless adapter into monitor mode and confirm packet injection capability.", tools: ["airmon-ng", "iw", "aireplay-ng --test"], tags: ["Setup"] },
        { id: "WIFI-05", title: "Channel targeting", desc: "Lock to the target channel and configure focused capture to avoid missing frames.", tools: ["airodump-ng -c", "iw set channel"], tags: ["Setup"] },
      ],
    },
    {
      id: "wpa",
      num: "03",
      title: "WPA2/WPA3-Personal Attacks",
      tag: "Wireless · Credential Access",
      summary: "Recover the pre-shared key via handshake capture or the clientless PMKID attack.",
      checks: [
        { id: "WIFI-06", title: "4-way handshake capture", desc: "Capture the WPA2 handshake, forcing it with a targeted deauth where permitted.", tools: ["airodump-ng", "aireplay-ng --deauth"], tags: ["Credential Access"] },
        { id: "WIFI-07", title: "PMKID (clientless) attack", desc: "Extract the PMKID directly from the AP without a connected client.", tools: ["hcxdumptool", "hcxpcapngtool"], tags: ["Credential Access"] },
        { id: "WIFI-08", title: "Offline PSK cracking", desc: "Crack the captured handshake/PMKID offline against wordlists and rules.", tools: ["hashcat -m 22000", "aircrack-ng"], tags: ["Credential Access"] },
        { id: "WIFI-09", title: "WPA3 / transition-mode review", desc: "Assess SAE configuration and test for WPA2 transition-mode downgrade exposure.", tools: ["hcxdumptool", "manual review"], tags: ["Credential Access"] },
      ],
    },
    {
      id: "wps",
      num: "04",
      title: "WPS Attacks",
      tag: "Wireless · Credential Access",
      summary: "Abuse Wi-Fi Protected Setup to recover the PSK.",
      checks: [
        { id: "WIFI-10", title: "WPS PIN brute force", desc: "Attack the online WPS PIN where rate limiting / lockout is absent.", tools: ["reaver", "bully"], tags: ["Credential Access"] },
        { id: "WIFI-11", title: "Pixie-Dust attack", desc: "Exploit weak WPS nonce/entropy to recover the PIN offline.", tools: ["reaver --pixie-dust", "bully", "wash"], tags: ["Credential Access"] },
      ],
    },
    {
      id: "enterprise",
      num: "05",
      title: "Enterprise (WPA-EAP) Attacks",
      tag: "Wireless · Credential Access",
      summary: "Target 802.1X/EAP networks via rogue RADIUS and credential capture.",
      checks: [
        { id: "WIFI-12", title: "Rogue RADIUS / evil-twin EAP", desc: "Stand up a rogue enterprise AP to capture MSCHAPv2 challenge/response from clients.", tools: ["hostapd-wpe", "eaphammer"], tags: ["Credential Access"] },
        { id: "WIFI-13", title: "EAP credential cracking", desc: "Crack captured MSCHAPv2 hashes to recover domain credentials.", tools: ["asleap", "hashcat -m 5500"], tags: ["Credential Access"] },
        { id: "WIFI-14", title: "Certificate validation review", desc: "Test whether clients validate the RADIUS server certificate — the control that defeats evil-twin.", tools: ["eaphammer", "client config review"], tags: ["Discovery"] },
      ],
    },
    {
      id: "rogue",
      num: "06",
      title: "Rogue AP / Evil Twin",
      tag: "Wireless · Initial Access",
      summary: "Lure clients to attacker-controlled APs for credential harvesting and client-side attacks.",
      checks: [
        { id: "WIFI-15", title: "Evil twin / karma", desc: "Clone a target SSID or answer probe requests to attract clients.", tools: ["eaphammer", "airbase-ng", "mdk4"], tags: ["Initial Access"] },
        { id: "WIFI-16", title: "Captive portal harvesting", desc: "Present a fake captive portal / PSK page to capture credentials.", tools: ["wifiphisher", "eaphammer"], tags: ["Credential Access"] },
        { id: "WIFI-17", title: "Client-side & MITM", desc: "Once a client is associated, intercept and manipulate its traffic.", tools: ["bettercap", "mitmproxy"], tags: ["Collection"] },
      ],
    },
    {
      id: "post",
      num: "07",
      title: "Post-Exploitation & Reporting",
      tag: "Wireless · Impact",
      summary: "Leverage wireless access to reach the internal network, assess segmentation, then clean up.",
      checks: [
        { id: "WIFI-18", title: "Pivot to internal network", desc: "Use recovered access to reach the wired/internal network and assess what the wireless segment exposes.", tools: ["nmap", "internal methodology"], tags: ["Lateral Movement"] },
        { id: "WIFI-19", title: "Segmentation & guest isolation", desc: "Verify guest/corporate separation and client-isolation controls.", tools: ["nmap", "manual testing"], tags: ["Discovery"] },
        { id: "WIFI-20", title: "Cleanup & evidence capture", desc: "Tear down rogue APs, stop injection and record captures, timestamps and screenshots for the report.", tags: ["Reporting"] },
      ],
    },
  ],
};

/* ============================ RED TEAM OPERATIONS (MITRE ATT&CK) ============================ */

const REDTEAM: Methodology = {
  id: "redteam",
  label: "Red Team Operations",
  blurb:
    "Objective-driven, full-scope adversary emulation following the MITRE ATT&CK kill-chain. Unlike a penetration test, the focus is achieving defined objectives stealthily while exercising the organisation's detection and response.",
  sourceLabel: "attack.mitre.org",
  sourceUrl: "https://attack.mitre.org/matrices/enterprise/",
  tagLabel: "ATT&CK",
  subLabel: "MITRE ATT&CK · Kill Chain",
  phases: [
    {
      id: "planning",
      num: "01",
      title: "Planning & Threat Emulation",
      tag: "Pre-ATT&CK",
      summary: "Define objectives, rules of engagement, the emulated adversary and the de-confliction process.",
      checks: [
        { id: "RT-01", title: "Objectives & rules of engagement", desc: "Agree crown-jewel objectives, scope, constraints, communications and de-confliction with the white cell.", tags: ["Planning"] },
        { id: "RT-02", title: "Threat profile selection", desc: "Select an adversary to emulate and map their TTPs to ATT&CK for a realistic engagement.", tools: ["ATT&CK Navigator", "threat intel"], tags: ["Planning"] },
      ],
    },
    {
      id: "recon",
      num: "02",
      title: "Reconnaissance",
      tag: "ATT&CK · Reconnaissance",
      summary: "Build a picture of the target's people, technology and external footprint.",
      checks: [
        { id: "RT-03", title: "OSINT & footprinting", desc: "Map domains, IP ranges, technologies and external services.", tools: ["Amass", "Shodan", "theHarvester"], tags: ["T1590", "T1596"] },
        { id: "RT-04", title: "Employee & email enumeration", desc: "Harvest employees, email formats and roles for targeting and phishing.", tools: ["theHarvester", "LinkedIn", "hunter.io"], tags: ["T1589", "T1591"] },
        { id: "RT-05", title: "Credential & breach exposure", desc: "Search breach data and paste sites for exposed corporate credentials.", tools: ["dehashed", "HaveIBeenPwned"], tags: ["T1589.001"] },
      ],
    },
    {
      id: "resource",
      num: "03",
      title: "Resource Development",
      tag: "ATT&CK · Resource Development",
      summary: "Stand up the infrastructure and tooling needed to operate stealthily.",
      checks: [
        { id: "RT-06", title: "C2 infrastructure", desc: "Deploy C2 with redirectors and categorised domains to resist takedown and detection.", tools: ["Cobalt Strike", "Mythic", "Sliver"], tags: ["T1583", "T1608"] },
        { id: "RT-07", title: "Payload development", desc: "Build and test loaders/payloads against the target's defences in a lab.", tools: ["custom loaders", "donut", "ScareCrow"], tags: ["T1587", "T1027"] },
        { id: "RT-08", title: "Phishing pretext & lures", desc: "Develop pretexts, lure documents and (where in scope) cloned authentication portals.", tools: ["Gophish", "evilginx2"], tags: ["T1585", "T1608"] },
      ],
    },
    {
      id: "access",
      num: "04",
      title: "Initial Access",
      tag: "ATT&CK · Initial Access",
      summary: "Establish the first foothold inside the environment.",
      checks: [
        { id: "RT-09", title: "Phishing", desc: "Deliver lures to obtain code execution or credentials.", tools: ["Gophish", "evilginx2", "HTML smuggling"], tags: ["T1566.001", "T1566.002"] },
        { id: "RT-10", title: "Valid accounts", desc: "Use harvested/sprayed credentials against external services (VPN, OWA, SSO).", tools: ["MFASweep", "o365 spray"], tags: ["T1078", "T1133"] },
        { id: "RT-11", title: "External exploitation / physical", desc: "Exploit exposed services or use physical / USB-drop access where in scope.", tools: ["nuclei", "custom exploits"], tags: ["T1190", "T1091"] },
      ],
    },
    {
      id: "c2",
      num: "05",
      title: "Execution & Command-and-Control",
      tag: "ATT&CK · Command and Control",
      summary: "Run payloads and establish resilient, low-profile C2.",
      checks: [
        { id: "RT-12", title: "Payload execution", desc: "Achieve execution on the beachhead while minimising host artefacts.", tools: ["Cobalt Strike", "Sliver"], tags: ["T1059", "T1204"] },
        { id: "RT-13", title: "C2 beaconing & egress", desc: "Establish beaconing over permitted egress (HTTPS, DNS, domain fronting) with jitter.", tools: ["malleable C2 profiles", "DNS C2"], tags: ["T1071", "T1572"] },
      ],
    },
    {
      id: "evasion",
      num: "06",
      title: "Persistence & Defense Evasion",
      tag: "ATT&CK · Defense Evasion",
      summary: "Maintain access and evade endpoint and detection controls.",
      checks: [
        { id: "RT-14", title: "Persistence", desc: "Establish durable, deniable persistence (run keys, scheduled tasks, services, WMI).", tools: ["schtasks", "Run keys", "WMI"], tags: ["T1547", "T1053.005"] },
        { id: "RT-15", title: "EDR / AV evasion", desc: "Bypass AMSI/ETW and EDR via in-memory execution, syscall unhooking and obfuscation.", tools: ["AMSI bypass", "direct syscalls"], tags: ["T1562.001", "T1027", "T1055"] },
      ],
    },
    {
      id: "escalate",
      num: "07",
      title: "Privilege Escalation & Credential Access",
      tag: "ATT&CK · Credential Access",
      summary: "Escalate privileges and harvest credentials to expand reach.",
      checks: [
        { id: "RT-16", title: "Local & domain privesc", desc: "Escalate locally and pursue domain escalation paths.", tools: ["winPEAS", "PowerUp", "Certify"], tags: ["T1068", "T1078"] },
        { id: "RT-17", title: "Credential dumping", desc: "Dump LSASS, SAM, DPAPI and Kerberos material with OPSEC-safe methods.", tools: ["nanodump", "Rubeus", "mimikatz"], tags: ["T1003", "T1558"] },
      ],
    },
    {
      id: "lateral",
      num: "08",
      title: "Discovery & Lateral Movement",
      tag: "ATT&CK · Lateral Movement",
      summary: "Map the environment and move toward the objective systems.",
      checks: [
        { id: "RT-18", title: "Situational awareness", desc: "Enumerate AD, sessions and trusts to find paths to the objective.", tools: ["BloodHound", "SharpHound", "PowerView"], tags: ["T1087", "T1482"] },
        { id: "RT-19", title: "Lateral movement", desc: "Move with stolen tickets/hashes toward crown-jewel hosts, minimising noise.", tools: ["Rubeus", "PsExec/WMI", "RDP"], tags: ["T1021", "T1550"] },
      ],
    },
    {
      id: "objective",
      num: "09",
      title: "Collection, Exfiltration & Impact",
      tag: "ATT&CK · Exfiltration",
      summary: "Achieve the engagement objective and demonstrate impact safely.",
      checks: [
        { id: "RT-20", title: "Locate & stage objective data", desc: "Identify and stage the agreed crown-jewel data or access.", tools: ["manual", "Snaffler"], tags: ["T1005", "T1074"] },
        { id: "RT-21", title: "Controlled exfiltration demo", desc: "Demonstrate exfiltration over a controlled channel to prove the objective.", tools: ["C2 exfil", "DNS/HTTPS"], tags: ["T1041", "T1048"] },
        { id: "RT-22", title: "Impact demonstration (safe)", desc: "Prove impact on the objective without causing real damage to production.", tags: ["T1486"] },
      ],
    },
    {
      id: "report",
      num: "10",
      title: "De-confliction, Cleanup & Reporting",
      tag: "ATT&CK · Impact",
      summary: "Tear down, capture the attack narrative and map detection gaps for the blue team.",
      checks: [
        { id: "RT-23", title: "Cleanup & teardown", desc: "Remove implants, persistence, accounts and infrastructure; document anything left behind.", tags: ["Cleanup"] },
        { id: "RT-24", title: "Attack narrative & timeline", desc: "Document the full kill-chain with timestamps to support detection engineering.", tags: ["Reporting"] },
        { id: "RT-25", title: "Detection gap mapping", desc: "Map executed TTPs to ATT&CK and what was / was not detected to drive blue-team improvements.", tools: ["ATT&CK Navigator"], tags: ["Reporting"] },
      ],
    },
  ],
};

export const METHODOLOGIES: Methodology[] = [WEB, INTERNAL, LINUX, MOBILE, WIFI, REDTEAM];
