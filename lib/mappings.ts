// Reference data for framework & compliance mapping.
// These are curated summaries to speed up report writing — official, authoritative
// control text lives at the linked sources. CWE lists per OWASP category are a
// representative selection, not the full mapping.

export type RefEntry = {
  id: string;
  title: string;
  desc?: string;
  tags?: string[];
  link?: string;
};

export type RefSet = {
  id: string;
  label: string;
  blurb: string;
  sourceLabel: string;
  sourceUrl: string;
  tagLabel?: string; // what the `tags` represent, e.g. "Key CWEs"
  entries: RefEntry[];
};

/* ============================ FRAMEWORKS ============================ */

const OWASP: RefSet = {
  id: "owasp",
  label: "OWASP Top 10",
  blurb: "The OWASP Top 10:2021 — the most critical web application security risks.",
  sourceLabel: "owasp.org/Top10",
  sourceUrl: "https://owasp.org/www-project-top-ten/",
  tagLabel: "Key CWEs",
  entries: [
    { id: "A01:2021", title: "Broken Access Control", desc: "Restrictions on what authenticated users are allowed to do are not properly enforced (IDOR, privilege escalation, CSRF).", tags: ["CWE-22", "CWE-284", "CWE-285", "CWE-352", "CWE-639", "CWE-862", "CWE-863"], link: "https://owasp.org/Top10/A01_2021-Broken_Access_Control/" },
    { id: "A02:2021", title: "Cryptographic Failures", desc: "Failures related to cryptography (or its absence) that expose sensitive data — cleartext transmission, weak algorithms.", tags: ["CWE-259", "CWE-319", "CWE-327", "CWE-331", "CWE-916"], link: "https://owasp.org/Top10/A02_2021-Cryptographic_Failures/" },
    { id: "A03:2021", title: "Injection", desc: "Untrusted data is sent to an interpreter — SQLi, OS command injection, and XSS now live here.", tags: ["CWE-79", "CWE-89", "CWE-78", "CWE-77", "CWE-94"], link: "https://owasp.org/Top10/A03_2021-Injection/" },
    { id: "A04:2021", title: "Insecure Design", desc: "Missing or ineffective control design — flaws that cannot be fixed by perfect implementation alone.", tags: ["CWE-209", "CWE-256", "CWE-501", "CWE-522", "CWE-657"], link: "https://owasp.org/Top10/A04_2021-Insecure_Design/" },
    { id: "A05:2021", title: "Security Misconfiguration", desc: "Insecure default configs, verbose errors, missing hardening, unnecessary features, and XXE.", tags: ["CWE-16", "CWE-260", "CWE-611", "CWE-614", "CWE-756"], link: "https://owasp.org/Top10/A05_2021-Security_Misconfiguration/" },
    { id: "A06:2021", title: "Vulnerable and Outdated Components", desc: "Use of components with known vulnerabilities or that are unsupported/out of date.", tags: ["CWE-937", "CWE-1035", "CWE-1104"], link: "https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/" },
    { id: "A07:2021", title: "Identification and Authentication Failures", desc: "Weaknesses in authentication — credential stuffing, weak passwords, broken session management.", tags: ["CWE-287", "CWE-294", "CWE-307", "CWE-384", "CWE-798"], link: "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/" },
    { id: "A08:2021", title: "Software and Data Integrity Failures", desc: "Code and infrastructure that does not protect against integrity violations — insecure deserialization, unsigned updates.", tags: ["CWE-345", "CWE-494", "CWE-502", "CWE-829"], link: "https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/" },
    { id: "A09:2021", title: "Security Logging and Monitoring Failures", desc: "Insufficient logging, detection, monitoring and active response to breaches.", tags: ["CWE-117", "CWE-223", "CWE-532", "CWE-778"], link: "https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/" },
    { id: "A10:2021", title: "Server-Side Request Forgery (SSRF)", desc: "The app fetches a remote resource without validating the user-supplied URL.", tags: ["CWE-918"], link: "https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/" },
  ],
};

const CWE: RefSet = {
  id: "cwe",
  label: "CWE",
  blurb: "Common Weakness Enumeration — frequently-cited weaknesses across web, infra and mobile assessments.",
  sourceLabel: "cwe.mitre.org",
  sourceUrl: "https://cwe.mitre.org/",
  tagLabel: "OWASP",
  entries: [
    { id: "CWE-79", title: "Cross-site Scripting (XSS)", desc: "Improper neutralization of input during web page generation.", tags: ["A03:2021"], link: "https://cwe.mitre.org/data/definitions/79.html" },
    { id: "CWE-89", title: "SQL Injection", desc: "Improper neutralization of special elements used in an SQL command.", tags: ["A03:2021"], link: "https://cwe.mitre.org/data/definitions/89.html" },
    { id: "CWE-78", title: "OS Command Injection", desc: "Improper neutralization of special elements used in an OS command.", tags: ["A03:2021"], link: "https://cwe.mitre.org/data/definitions/78.html" },
    { id: "CWE-22", title: "Path Traversal", desc: "Improper limitation of a pathname to a restricted directory.", tags: ["A01:2021"], link: "https://cwe.mitre.org/data/definitions/22.html" },
    { id: "CWE-352", title: "Cross-Site Request Forgery (CSRF)", desc: "Web app does not verify a request was intentionally provided by the user.", tags: ["A01:2021"], link: "https://cwe.mitre.org/data/definitions/352.html" },
    { id: "CWE-287", title: "Improper Authentication", desc: "Actor claims an identity but the proof is not sufficiently verified.", tags: ["A07:2021"], link: "https://cwe.mitre.org/data/definitions/287.html" },
    { id: "CWE-639", title: "Authorization Bypass (IDOR)", desc: "Access control bypass through a user-controlled key.", tags: ["A01:2021"], link: "https://cwe.mitre.org/data/definitions/639.html" },
    { id: "CWE-862", title: "Missing Authorization", desc: "No authorization check is performed when access is attempted.", tags: ["A01:2021"], link: "https://cwe.mitre.org/data/definitions/862.html" },
    { id: "CWE-798", title: "Use of Hard-coded Credentials", desc: "Hard-coded credentials for inbound auth or outbound communication.", tags: ["A07:2021"], link: "https://cwe.mitre.org/data/definitions/798.html" },
    { id: "CWE-306", title: "Missing Authentication for Critical Function", desc: "No authentication is required for functionality that warrants it.", tags: ["A07:2021"], link: "https://cwe.mitre.org/data/definitions/306.html" },
    { id: "CWE-307", title: "Improper Restriction of Excessive Auth Attempts", desc: "No lockout/rate-limiting enables brute force.", tags: ["A07:2021"], link: "https://cwe.mitre.org/data/definitions/307.html" },
    { id: "CWE-521", title: "Weak Password Requirements", desc: "Password policy does not enforce sufficient strength.", tags: ["A07:2021"], link: "https://cwe.mitre.org/data/definitions/521.html" },
    { id: "CWE-319", title: "Cleartext Transmission of Sensitive Information", desc: "Sensitive data transmitted in cleartext (HTTP, Telnet, FTP).", tags: ["A02:2021"], link: "https://cwe.mitre.org/data/definitions/319.html" },
    { id: "CWE-327", title: "Broken or Risky Cryptographic Algorithm", desc: "Use of a weak or non-standard cryptographic algorithm.", tags: ["A02:2021"], link: "https://cwe.mitre.org/data/definitions/327.html" },
    { id: "CWE-916", title: "Weak Password Hash", desc: "Password hashed with insufficient computational effort.", tags: ["A02:2021"], link: "https://cwe.mitre.org/data/definitions/916.html" },
    { id: "CWE-200", title: "Exposure of Sensitive Information", desc: "Information disclosure to an unauthorized actor.", tags: ["A01:2021"], link: "https://cwe.mitre.org/data/definitions/200.html" },
    { id: "CWE-209", title: "Sensitive Info in Error Message", desc: "Error message exposes sensitive details (stack traces, queries).", tags: ["A04:2021"], link: "https://cwe.mitre.org/data/definitions/209.html" },
    { id: "CWE-918", title: "Server-Side Request Forgery (SSRF)", desc: "App fetches a URL without validating the user-supplied target.", tags: ["A10:2021"], link: "https://cwe.mitre.org/data/definitions/918.html" },
    { id: "CWE-502", title: "Deserialization of Untrusted Data", desc: "Untrusted data is deserialized without sufficient validation.", tags: ["A08:2021"], link: "https://cwe.mitre.org/data/definitions/502.html" },
    { id: "CWE-611", title: "Improper Restriction of XXE", desc: "XML external entity references are improperly restricted.", tags: ["A05:2021"], link: "https://cwe.mitre.org/data/definitions/611.html" },
    { id: "CWE-434", title: "Unrestricted Upload of Dangerous File Type", desc: "App allows upload of files that can be executed server-side.", tags: ["A04:2021"], link: "https://cwe.mitre.org/data/definitions/434.html" },
    { id: "CWE-1021", title: "Improper Restriction of Rendered UI (Clickjacking)", desc: "Missing frame-ancestors / X-Frame-Options enables UI redress.", tags: ["A04:2021"], link: "https://cwe.mitre.org/data/definitions/1021.html" },
    { id: "CWE-614", title: "Sensitive Cookie Without 'Secure' Attribute", desc: "Session cookie set without the Secure flag.", tags: ["A05:2021"], link: "https://cwe.mitre.org/data/definitions/614.html" },
    { id: "CWE-693", title: "Protection Mechanism Failure", desc: "Missing/disabled defenses such as security response headers.", tags: ["A05:2021"], link: "https://cwe.mitre.org/data/definitions/693.html" },
    { id: "CWE-1104", title: "Use of Unmaintained Third-Party Components", desc: "Reliance on components no longer supported by the maintainer.", tags: ["A06:2021"], link: "https://cwe.mitre.org/data/definitions/1104.html" },
    { id: "CWE-601", title: "Open Redirect", desc: "URL redirection to an untrusted, attacker-controlled site.", tags: ["A01:2021"], link: "https://cwe.mitre.org/data/definitions/601.html" },
  ],
};

const MITRE: RefSet = {
  id: "mitre",
  label: "MITRE ATT&CK",
  blurb: "ATT&CK Enterprise tactics — the adversary's tactical goals, with example techniques.",
  sourceLabel: "attack.mitre.org",
  sourceUrl: "https://attack.mitre.org/tactics/enterprise/",
  tagLabel: "Example techniques",
  entries: [
    { id: "TA0043", title: "Reconnaissance", desc: "Gathering information to plan future operations.", tags: ["T1595 Active Scanning", "T1592 Victim Host Info"], link: "https://attack.mitre.org/tactics/TA0043/" },
    { id: "TA0042", title: "Resource Development", desc: "Establishing resources to support operations.", tags: ["T1583 Acquire Infrastructure", "T1587 Develop Capabilities"], link: "https://attack.mitre.org/tactics/TA0042/" },
    { id: "TA0001", title: "Initial Access", desc: "Getting into the network.", tags: ["T1190 Exploit Public-Facing App", "T1566 Phishing", "T1078 Valid Accounts"], link: "https://attack.mitre.org/tactics/TA0001/" },
    { id: "TA0002", title: "Execution", desc: "Running adversary-controlled code.", tags: ["T1059 Command & Scripting Interpreter"], link: "https://attack.mitre.org/tactics/TA0002/" },
    { id: "TA0003", title: "Persistence", desc: "Maintaining a foothold across restarts.", tags: ["T1136 Create Account", "T1053 Scheduled Task/Job"], link: "https://attack.mitre.org/tactics/TA0003/" },
    { id: "TA0004", title: "Privilege Escalation", desc: "Gaining higher-level permissions.", tags: ["T1068 Exploitation for PrivEsc", "T1134 Access Token Manipulation"], link: "https://attack.mitre.org/tactics/TA0004/" },
    { id: "TA0005", title: "Defense Evasion", desc: "Avoiding detection.", tags: ["T1070 Indicator Removal", "T1027 Obfuscated Files"], link: "https://attack.mitre.org/tactics/TA0005/" },
    { id: "TA0006", title: "Credential Access", desc: "Stealing account names and secrets.", tags: ["T1110 Brute Force", "T1003 OS Credential Dumping", "T1558 Kerberos Tickets"], link: "https://attack.mitre.org/tactics/TA0006/" },
    { id: "TA0007", title: "Discovery", desc: "Learning about the environment.", tags: ["T1046 Network Service Discovery", "T1087 Account Discovery"], link: "https://attack.mitre.org/tactics/TA0007/" },
    { id: "TA0008", title: "Lateral Movement", desc: "Moving through the environment.", tags: ["T1021 Remote Services", "T1550 Alternate Auth Material"], link: "https://attack.mitre.org/tactics/TA0008/" },
    { id: "TA0009", title: "Collection", desc: "Gathering data of interest.", tags: ["T1005 Data from Local System"], link: "https://attack.mitre.org/tactics/TA0009/" },
    { id: "TA0011", title: "Command and Control", desc: "Communicating with compromised systems.", tags: ["T1071 Application Layer Protocol"], link: "https://attack.mitre.org/tactics/TA0011/" },
    { id: "TA0010", title: "Exfiltration", desc: "Stealing data.", tags: ["T1041 Exfiltration Over C2 Channel"], link: "https://attack.mitre.org/tactics/TA0010/" },
    { id: "TA0040", title: "Impact", desc: "Manipulating, interrupting or destroying systems and data.", tags: ["T1486 Data Encrypted for Impact", "T1498 Network DoS"], link: "https://attack.mitre.org/tactics/TA0040/" },
  ],
};

export const FRAMEWORKS: RefSet[] = [OWASP, CWE, MITRE];

/* ============================ COMPLIANCE ============================ */

const ISO27001: RefSet = {
  id: "iso",
  label: "ISO/IEC 27001:2022",
  blurb: "Annex A controls (93 across 4 themes). A selection most relevant to technical findings.",
  sourceLabel: "iso.org/standard/27001",
  sourceUrl: "https://www.iso.org/standard/27001",
  tagLabel: "Theme",
  entries: [
    { id: "A.5.7", title: "Threat intelligence", desc: "Collect and analyse information about threats.", tags: ["Organizational"] },
    { id: "A.5.15", title: "Access control", desc: "Rules to control physical and logical access based on business and security requirements.", tags: ["Organizational"] },
    { id: "A.5.17", title: "Authentication information", desc: "Allocation and management of authentication information.", tags: ["Organizational"] },
    { id: "A.5.18", title: "Access rights", desc: "Provision, review, modification and removal of access rights.", tags: ["Organizational"] },
    { id: "A.7.1", title: "Physical security perimeters", desc: "Define and protect perimeters securing sensitive areas.", tags: ["Physical"] },
    { id: "A.7.2", title: "Physical entry", desc: "Secure areas protected by appropriate entry controls and access points.", tags: ["Physical"] },
    { id: "A.8.2", title: "Privileged access rights", desc: "Restrict and manage the allocation/use of privileged access.", tags: ["Technological"] },
    { id: "A.8.5", title: "Secure authentication", desc: "Secure authentication technologies and procedures.", tags: ["Technological"] },
    { id: "A.8.8", title: "Management of technical vulnerabilities", desc: "Obtain info on vulnerabilities, evaluate exposure and take action.", tags: ["Technological"] },
    { id: "A.8.9", title: "Configuration management", desc: "Establish, document, implement and monitor secure configurations.", tags: ["Technological"] },
    { id: "A.8.20", title: "Networks security", desc: "Secure and manage networks and network devices.", tags: ["Technological"] },
    { id: "A.8.21", title: "Security of network services", desc: "Identify and apply security mechanisms for network services.", tags: ["Technological"] },
    { id: "A.8.23", title: "Web filtering", desc: "Manage access to external websites to reduce malicious content exposure.", tags: ["Technological"] },
    { id: "A.8.24", title: "Use of cryptography", desc: "Rules for effective use of cryptography, including key management.", tags: ["Technological"] },
    { id: "A.8.25", title: "Secure development life cycle", desc: "Establish and apply rules for secure development of software/systems.", tags: ["Technological"] },
    { id: "A.8.26", title: "Application security requirements", desc: "Identify and approve security requirements for applications.", tags: ["Technological"] },
    { id: "A.8.28", title: "Secure coding", desc: "Apply secure coding principles to software development.", tags: ["Technological"] },
  ],
};

const PCIDSS: RefSet = {
  id: "pci",
  label: "PCI DSS v4.0",
  blurb: "The 12 core requirements of the Payment Card Industry Data Security Standard v4.0.",
  sourceLabel: "pcisecuritystandards.org",
  sourceUrl: "https://www.pcisecuritystandards.org/",
  tagLabel: "Goal",
  entries: [
    { id: "Req 1", title: "Install and Maintain Network Security Controls", desc: "Firewalls and network segmentation protecting the cardholder data environment.", tags: ["Secure Network"] },
    { id: "Req 2", title: "Apply Secure Configurations", desc: "No vendor defaults; harden all system components.", tags: ["Secure Network"] },
    { id: "Req 3", title: "Protect Stored Account Data", desc: "Minimise storage; render stored account data unreadable.", tags: ["Protect Data"] },
    { id: "Req 4", title: "Protect CHD with Strong Cryptography in Transit", desc: "Encrypt cardholder data across open, public networks.", tags: ["Protect Data"] },
    { id: "Req 5", title: "Protect Against Malicious Software", desc: "Anti-malware on all systems commonly affected.", tags: ["Vuln Mgmt"] },
    { id: "Req 6", title: "Develop and Maintain Secure Systems and Software", desc: "Secure SDLC and timely patching of vulnerabilities.", tags: ["Vuln Mgmt"] },
    { id: "Req 7", title: "Restrict Access by Business Need to Know", desc: "Least-privilege access to system components and data.", tags: ["Access Control"] },
    { id: "Req 8", title: "Identify Users and Authenticate Access", desc: "Unique IDs and strong authentication (incl. MFA).", tags: ["Access Control"] },
    { id: "Req 9", title: "Restrict Physical Access to Cardholder Data", desc: "Physical access controls for facilities and media.", tags: ["Access Control"] },
    { id: "Req 10", title: "Log and Monitor All Access", desc: "Audit logging and monitoring of access to systems and data.", tags: ["Monitoring"] },
    { id: "Req 11", title: "Test Security of Systems and Networks Regularly", desc: "Vulnerability scanning and penetration testing.", tags: ["Monitoring"] },
    { id: "Req 12", title: "Support Security with Organizational Policies", desc: "Maintain a programme of policies and awareness.", tags: ["Policy"] },
  ],
};

const NISTCSF: RefSet = {
  id: "nist",
  label: "NIST CSF 2.0",
  blurb: "The six Functions of the NIST Cybersecurity Framework 2.0 and their key categories.",
  sourceLabel: "nist.gov/cyberframework",
  sourceUrl: "https://www.nist.gov/cyberframework",
  tagLabel: "Key categories",
  entries: [
    { id: "GV", title: "Govern", desc: "Establish and monitor the cybersecurity risk management strategy, expectations and policy.", tags: ["GV.OC", "GV.RM", "GV.RR", "GV.PO", "GV.OV", "GV.SC"] },
    { id: "ID", title: "Identify", desc: "Understand assets, suppliers and related cybersecurity risks.", tags: ["ID.AM", "ID.RA", "ID.IM"] },
    { id: "PR", title: "Protect", desc: "Use safeguards to manage cybersecurity risks (access, data, platform security).", tags: ["PR.AA", "PR.AT", "PR.DS", "PR.PS", "PR.IR"] },
    { id: "DE", title: "Detect", desc: "Find and analyse possible cybersecurity attacks and compromises.", tags: ["DE.CM", "DE.AE"] },
    { id: "RS", title: "Respond", desc: "Take action regarding a detected cybersecurity incident.", tags: ["RS.MA", "RS.AN", "RS.CO", "RS.MI"] },
    { id: "RC", title: "Recover", desc: "Restore assets and operations affected by a cybersecurity incident.", tags: ["RC.RP", "RC.CO"] },
  ],
};

export const COMPLIANCE: RefSet[] = [ISO27001, PCIDSS, NISTCSF];
