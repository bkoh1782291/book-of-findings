// Penetration testing methodology reference.
// Curated, phase-by-phase playbooks to structure engagements and report scoping.
// Web app phases follow the OWASP Web Security Testing Guide (WSTG v4.2); internal
// phases follow PTES + the Active Directory attack kill-chain, tagged with MITRE
// ATT&CK technique IDs. Checks are a representative selection of the highest-value
// tests per phase — the authoritative, exhaustive guidance lives at the linked source.

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
  label: "Internal Network",
  blurb:
    "Internal / Active Directory penetration testing following the PTES execution flow and the AD attack kill-chain. Each phase is tagged with MITRE ATT&CK technique IDs for reporting and detection mapping.",
  sourceLabel: "attack.mitre.org",
  sourceUrl: "https://attack.mitre.org/matrices/enterprise/",
  tagLabel: "ATT&CK",
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

export const METHODOLOGIES: Methodology[] = [WEB, INTERNAL];
