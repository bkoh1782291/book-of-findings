/* 

  Book of Findings app 
  To-Do:
  - add multiple select for findings
  - copy all selected findings
  - findings export
*/


"use client";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type Finding = {
  name: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  observation: string;
  impact: string;
  recommendation: string;
  type: "Web App" | "Mobile" | "Infra" | "Wi-Fi" | "Thick Client" | "Red Team" | "Source Code" | "Others";
};

const findings: Finding[] = [
  {
    name: "Cookie SameSite Flag",
    severity: "Low",
    observation: "During the assessment, KPMG identified that the web application does not have the \"SameSite\" attribute enabled for cookies.",
    impact: "The lack of the SameSite flag Increases the risk of CSRF attacks by allowing cookies to be sent with cross-site requests.",
    recommendation: "Set the SameSite attribute to Strict or Lax for all cookies. Use SameSite=None only when cross-site usage is necessary.",
    type: "Web App",
  },
  {
    name: "Permissions-Policy Security Header Missing",
    severity: "Low",
    observation: "During the assessment, KPMG discovered that the \"Permissions-Policy\" Security Header is absent from the web application.",
    impact: "Without the \"Permissions-Policy\" Security Header, the web application is unable to restrict the use of browser features in its own frame and in iframes that it embeds. This means that web features are not controlled.",
    recommendation: "Reconfigure the web application with the \"Permissions-Policy\" Security Header enabled. Additionally, The values of the header can be set based on controls such as geolocation, microphone, camera and others.",
    type: "Web App"
  },
  {
    name: "Cross-Origin-Embedder-Policy Security Header Missing",
    severity: "Low",
    observation: "During the assessment, KPMG discovered that the \"Cross-Origin-Embedder-Policy\" Security Header was not configured on the web application.",
    impact: "Without the \"Cross-Origin-Embedder-Policy\" Security Header, the web application can't prevent a document from accessing cross-origin resources.",
    recommendation: "Reconfigure the web application with the \"Cross-Origin-Embedder-Policy\" Security Header enabled. Additionally, set the value to 'require-corp' which ensures that only trusted sources can be loaded.",
    type: "Web App"
  },
  {
    name: "Cross-Origin-Resource-Policy Security Header Missing",
    severity: "Low",
    observation: "During the assessment, KPMG discovered that the \"Cross-Origin-Resource-Policy\" Security Header is absent from the web application. The purpose of the header is to control which origins can load your resources (e.g., images, scripts), preventing unauthorized cross-origin access.",
    impact: "Without the \"Cross-Origin-Resource-Policy\" Security Header, the web application is unable to block access to a specific resource that is sent by the server.",
    recommendation: "Reconfigure the web application with the \"Cross-Origin-Resource-Policy\" Security Header enabled. Additionally, ensure that the value set for the policy is \"same-origin\", or \"same-site\". This means that the resources are only allowed to be fetched from the same origin or the same site.",
    type: "Web App"
  },
  {
    name: "Plaintext Password Submission",
    severity: "High",
    observation: "During the assessment, KPMG observed that the web application submits the username and password credentials in plaintext.",
    impact: "The impact of having credentials transmitted in plaintext, is that it can be intercepted by attackers (e.g., via packet sniffing). This leads to credential theft and unauthorized access.",
    recommendation: "Enforce HTTPS for all data transmissions for the web application and Implement HSTS (HTTP Strict Transport Security).",
    type: "Web App"
  },
  {
    name: "Unencrypted Website Communications",
    severity: "High",
    observation: "During the assessment, KPMG observed that the web application uses plaintext communications instead of encrypted communications.",
    impact: "The web application's communications between the client and the server is unencrypted. Hence, sensitive information such as usernames and passwords are unencrypted and viewable by attackers that are listening to the network traffic.",
    recommendation: "Reconfigure the web application with HTTPS and a valid TLS certificate.",
    type: "Web App"
  },
  {
    name: "Double File Extension File Upload",
    severity: "High",
    observation: "During the assessment, KPMG observed that the web application allows files with double extensions (e.g., file.php.jpg) to be uploaded without proper validation, potentially bypassing security filters.",
    impact: "Attackers can upload malicious scripts disguised as harmless files. If executed on the server, this could lead to remote code execution, data breaches, or full server compromise.",
    recommendation: "Reject files with multiple extensions and use a whitelist approach for allowed file types. Store uploaded files outside the web root and rename them to prevent execution.",
    type: "Web App"
  },
  {
    name: "SQL Injection Vulnerability (Time-Based Blind)",
    severity: "Critical",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application is vulnerable to a Time-Based Blind SQL Injection.",
    impact: "SQL Injection allows an attacker to extract data and possibly modify information within the database using SQL queries that are executable.",
    recommendation: "Reconfigure the web application's login page with sufficient Input Validation and Sanitization, removing special characters that are used in SQL queries and prepared SQL statements that handle SQL queiries safely."
  },
  {
    name: "Microsoft SQL Server Version Outdated and Unsupported",
    severity: "Critical",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application is vulnerable due to the SQL Server's version, which is running Microsoft SQL Server 2012. This version of SQL is outdated and unsupported.",
    impact: "The outdated Microsoft SQL version contains multiple well known vulnerabilities that are unpatched. In addition, security support for the SQL server has been deprecated.",
    recommendation: "Reconfigure the application with an updated SQL version that is still supported wiith security updates. Examples such as SQL Server 2019 or SQL Server 2022."
  },
  {
    name: "Stored Cross Site Scripting (XSS)",
    severity: "Critical",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application is vulnerable to Stored Cross-Site Scripting Attacks. This means that the XSS Payload was persistently stored on the web application.",
    impact: "XSS allows attackers to inject malicious scripts into web pages viewed by other users. This can lead to session hijacking, credential theft, defacement, or redirection to malicious sites, compromising user trust and application integrity.",
    recommendation: "Sanitize and encode all user input before rendering it in the browser. Use frameworks or libraries that auto-escape output (e.g., React, Angular). Implement Content Security Policy (CSP) headers to restrict script execution and regularly test for XSS using automated tools."
  },
  {
    name: "Reflected Cross-Site Scripting (XSS)",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application is vulnerable to Reflected Cross-Site Scripting Attacks.",
    impact: "XSS allows attackers to inject malicious scripts into web pages viewed by other users. This can lead to session hijacking, credential theft, defacement, or redirection to malicious sites, compromising user trust and application integrity.",
    recommendation: "Sanitize and encode all user input before rendering it in the browser. Use frameworks or libraries that auto-escape output (e.g., React, Angular). Implement Content Security Policy (CSP) headers to restrict script execution and regularly test for XSS using automated tools."
  },
  {
    name: "Command Injection",
    severity: "Critical",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application is vulnerable to Command Injections. This was observed through the injection of HTML code that retrieved the website's cookie values.",
    impact: "Command Injection allows attackers to execute arbitrary system commands on the server through scirpts and malicious code. This can lead to full system compromise, data theft, or service disruption.",
    recommendation: "Reconfigure the web application to use parameterized queries or safe APIs that do not leak any information from the malicious code. More importantly, validate and sanitize all user inputs strictly. Lastly, run applications with the least privileges necessary."
  },
  {
    name: "Arbitrary File Execution via File Upload",
    severity: "Critical",
    type: "Web App",
    observation: `During the assessment, KPMG identified that a javascript within an uploaded PDF file
    was successfully executed upon opening the file.`,
    impact: `This behavior can be exploited to gain unauthorized access, 
    execute arbitrary code, or compromise the server.`,
    recommendation: `Implement security measures as below:
       - Never allow uploaded files to be executed.
       - Store files outside the web root.
       - Use strict file type and content validation.
       - Sanitize and rename uploaded files.
      - Implement antivirus scanning and sandboxing.`
  },
  {
    name: "Unrestricted Access to API Token Generation Page",
    severity: "Critical",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the directory listing page includes an API token generation page which is publicly accessible without authentication.",
    impact: "Unauthorised users may generate valid API tokens, potentially allowing priviledge escalation or data exfiltration. If tokens generated are long-lived or have broad-scopes, risk of abuse may be higher.",
    recommendation: "Restrict access to the token generation page using proper authentication and authorization mechanisms."
  },
  {
    name: "Sensitive Directories & Pages Publicly Accessible",
    severity: "Critical",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the directory listing page (refer WA-05) includes sensitive pages and directories that are publicly accessible.",
    impact: "Unauthorised users may access the directories potentially causing information leakage or compromising of data integrity.",
    recommendation: "Restrict access to the the directory listing page by using proper authentication and authorization mechanims."
  },
  {
    name: "Redis Server Unprotected by Password Authentication",
    severity: "Critical",
    type: "Web App",
    observation: "During the assessment KPMG identified that the Redis server running on the remote host does not require any password authentication to access it. ",
    impact: "The lack of password authentication on Redis server allows attackers to gain unauthorized access to the Redis server, execute arbitary commands,  gain access to sensitive data, modify and delete the sensitive data, and has potential to escalate privileges within the network.",
    recommendation: "Secure the Redis server by enabling password authentication. "
  },
  {
    name: "Sensitive Page Accessible",
    severity: "Critical",
    type: "Web App",
    observation: "During the assessment, KPMG identified a sensitive page that allows the creation of databases.",
    impact: "Attackers could use these pages to gain insights into application structure or exploit unintended functionalities.",
    recommendation: "Remove these unwanted web pages."
  },
  {
    name: "Multiple Unsupported Web Server Version",
    severity: "Critical",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application is running with a version of the Web Server that has reached its end of life product cycle, which means that the web server will no longer be supported or updated by the official vendor.",
    impact: "Using software that is no longer supported by the vendor implies that no new security patches for the product will be implemented. As a result, the product may contain future vulnerabilities that will never be fixed.",
    recommendation: `Upgrade Microsoft IIS to version 8.0 or above.
    Upgrade Apache HTTP Server to version 2.4.43 or above.
    
    References:
    https://docs.microsoft.com/en-us/lifecycle/products/internet-information-services-iis
    https://httpd.apache.org/`
  },
  {
    name: "Unsupported Server Version",
    severity: "Critical",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the listed server software version has reached its End of Life product cycle: Example: Microsoft IIS 7.5 on Windows Server 2008 R2, EOL support Jan 14, 2020",
    impact: "Using software that no longer supported by the vendor implies that no new security patches for the product will be released. As a result, the product may contain future security vulnerabilities that will never be fixed.",
    recommendation: `Based on Microsoft's latest Support Releases, it is recommended to upgrade to Microsoft IIS to version 10.
      References:
    https://support.oracle.com/knowledge/Oracle%20Database%20Products/742060_1.html`
  },
  {
    name: "Unsupported PHP Version",
    severity: "Critical",
    type: "Infra",
    observation: "During the assessment, KPMG noticed that the PHP version in used were outdated and will not have any updates or fixes in future by the official vendor.",
    impact: "Using software that no longer supported by the vendor implies that no new security patches for the product will be added in the future. As a result, the product may contain future security vulnerabilities that will never be fixed.",
    recommendation: "It is best practice as defined by industry standards to keep software updated as much as possible, to prevent attackers exploiting old versions of software Ex. Upgrade to latest version of PHP 7.4.X"
  },
  {
    name: "Vulnerable Apache/Tomcat version",
    severity: "Critical",
    type: "Infra",
    observation: "During the assessment, KPMG noted that the Tomcat version is outdated, and it's exploits/vulnerabilities are well known, which makes the Apache server more vulnerable.",
    impact: `An HTTP request smuggling vulnerability exists in Tomcat due to mishandling Transfer-Encoding headers behind a reverse proxy. An unauthenticated, remote attacker can exploit this, via crafted HTTP requests, to cause unintended HTTP requests to reach the back-end. (CVE-2019-17569)
    - An HTTP request smuggling vulnerability exists in Tomcat due to bad end-of-line (EOL) parsing that allowed some invalid HTTP headers to be parsed as valid. An unauthenticated, remote attacker can exploit this, via crafted HTTP requests, to cause unintended HTTP requests to reach the back-end. (CVE-2020-1935)`,
    recommendation: "Upgrade to Apache Tomcat version 7.0.100, 8.5.51, 9.0.31 or later."
  },
  {
    name: "Insecure Direct Object Reference (IDOR)",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application exposes internal object indentifiers in URLs.",
    impact: "Unauthorised users may gain access or modify records belonging to other users, which violates confidentiality and integrity.",
    recommendation: "Enforce strict server-side control checks for every request and avoid relying on client-supplied object references. Consider using indirect identifiers."
  },
  {
    name: "Stored HTML Injection",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application is vulnerable to HTML Injection.",
    impact: "Stored HTML Injection enables attackers to inject arbitrary HTML content into the application, which is then stored and rendered to other users. This can lead to UI redressing, phishing, or even XSS if scripts are embedded.",
    recommendation: "Validate and sanitize all user-submitted HTML content. If HTML input is necessary (e.g., for rich text), use a secure HTML sanitizer (like DOMPurify) to strip dangerous tags and attributes. Avoid rendering raw HTML unless absolutely required."
  },
  {
    name: "Web Application Hosted Over Unencrypted Connection (HTTP)",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application uses plaintext communications instead of encrypted communications.",
    impact: "The web application's communications between the client and the server is unencrypted. Hence, sensitive information such as usernames and passwords are unencrypted and veiwable by attackers that are listening to the network traffic.",
    recommendation: "Migrate the website to HTTPS by implementing a valid SSL/TLS certificate. Additionally, configure HTTP Strict Transport Security (HSTS) to enforce secure connections and prevent protocol downgrade attacks."
  },
  {
    name: "Double File Extension File Upload",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application allows files with double extensions (e.g., file.php.jpg) to be uploaded without proper validation, potentially bypassing security filters.",
    impact: "Attackers can upload malicious scripts disguised as harmless files. If executed on the server, this could lead to remote code execution, data breaches, or full server compromise.",
    recommendation: "Reject files with multiple extensions and use a whitelist approach for allowed file types. Store uploaded files outside the web root and rename them to prevent execution."
  },
  {
    name: "Unrestricted File Type Upload",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application permits file uploads without enforcing restrictions on file type, size, or content.",
    impact: "This allows the attacker to perform various attacks, including malware uploads, defacement, or denial of service (DoS) through large file uploads.",
    recommendation: "Enforce file type restrictions using both MIME type and file extension checks. In addition, limiting file size, scanning uploads for malware, and store them in a non-executable directory."
  },
  {
    name: "Unrestricted File Size Upload",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application permits file uploads without enforcing restrictions on file type, size, or content.",
    impact: "This allows the attacker to perform denial of service (DoS) attacks through large file uploads.",
    recommendation: "Enforce file type restrictions using both MIME type and file extension checks. In addition, limiting file size, scanning uploads for malware, and store them in a non-executable directory."
  },
  {
    name: "Cleartext Submission of Credentials",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the application transmits user credentials (such as usernames and passwords) in cleartext over the network.",
    impact: "The transmission of credentials in cleartext exposes sensitive information to potential interception by attackers through network sniffing or man-in-the-middle (MitM) attacks. This can lead to unauthorized access and compromise of user accounts and system integrity.",
    recommendation: "Implement secure transmission protocols such as HTTPS (TLS) to encrypt all sensitive data in transit, including login credentials. Ensure that all forms and authentication mechanisms enforce secure communication channels. Additionally, configure HTTP Strict Transport Security (HSTS) to prevent protocol downgrade attacks and ensure all connections are made securely."
  },
  {
    name: "Improper Error Message Handling",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application has improper error messages handling. For this example, the error message leaks SQL queries in the web application.",
    impact: "Detailed error messages can reveal sensitive information (e.g., stack traces, database structure). This aids attackers in crafting targeted attacks.",
    recommendation: "Reconfigure the web application to display generic error messages to users when errors are present. However, it is also important to log detailed errors internally for debugging."
  },
  {
    name: "Editable User Permissions",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application has improper access controls. In this example, the user is able to edit permissions and give privileged access to themselves.",
    impact: "Users with excessive or editable permissions can escalate privileges or access unauthorized data. This the Increases risk of insider threats and accidental misconfigurations.",
    recommendation: "Reconfigure the web application with Role-Based Access Control (RBAC). Do not allow non-privileged users to change privileges on other users. In addition, regularly audit user roles and permissions. And enforce the principle of least privilege."
  },
  {
    name: "Browsable Web Directories",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application allows directory traversal, where a hidden directory was found.",
    impact: "Web directories that are browsable exposes sensitive files and directory structure to attackers. This can lead to information disclosure and further exploitation.",
    recommendation: `Disable directory listing in the web server configuration.
Use .htaccess or server settings to restrict access.
    Ensure sensitive files are stored outside the web root.`
  },
  {
    name: "Broken Access Control via Session Hijacking (Cookie Manipulation)",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that it was possible to escalate privileges from a normal user to an admin user by capturing and reusing a valid session ID belonging to an admin user.",
    impact: "An attacker can escalate privileges to an admin by sniffing a session ID, potentially gaining full access to sensitive functionalities.",
    recommendation: "Enforce HTTPS, set Secure/HttpOnly/SameSite cookie flags, and bind sessions to IP or user context to prevent unauthorized session reuse."
  },
  {
    name: "Session Hijacking",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that it was possible to login to the web application by capturing and reusing a valid session ID belonging to a valid user",
    impact: "An attacker can egain access to the web application by sniffing a session ID, potentially gainin access to sensitive functionalities.",
    recommendation: "Enforce HTTPS, set Secure/HttpOnly/SameSite cookie flags, and bind sessions to IP or user context to prevent unauthorized session reuse."
  },
  {
    name: "Vulnerable Web Application Library (highcharts)",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application uses an outdated and vulnerable version of: - highcharts (x.x.x)",
    impact: "Vulnerable to XSS and prototype pollution, increasing risk of client-side manipulation and data leakage.",
    recommendation: `Update the following jquery version to:
    - At least 3.5.0`
  },
  {
    name: "HTTP Methods \"DELETE\", \"PATCH\" & \"PROPFIND\" Allowed",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application allows the following HTTP Methods: - DELETE - PATCH - PROPFIND",
    impact: "Allowing potentially dangerous HTTP methods such as DELETE, PATCH, and PROPFIND increases the attack surface of the web application. These methods can be abused by an attacker to modify, delete, or enumerate sensitive resources, potentially leading to unauthorized access, data loss, or exposure of internal directory structures.",
    recommendation: "Block or return 405 Method Not Allowed for the specified HTTP requests unless explicitly needed and properly secured."
  },
  {
    name: "Reflected XSS",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that after a failed login attempt, a vulnerable parameter (em) is appended to the URL and reflects user-supplied input without proper sanitization, allowing the execution of a reflected Cross-Site Scripting (XSS) attack.",
    impact: "Allows attackers to execute arbitrary JavaScript in the user’s browser, potentially leading to session hijacking or phishing.",
    recommendation: "Remove all unnecessary parameters (e.g., ui, lid, em, ema) from URLs, especially after failed login attempts, by redirecting users to clean URLs. While the em parameter is confirmed vulnerable, removing all parameters helps mitigate reflected XSS and limits exposure of sensitive data."
  },
  {
    name: "Outdated Operating System",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the Web Server is using an outdated Operating System. Examples Include: 1. Windows 7 Professional 2. Windows Server 2008",
    impact: "An outdated operating system will be vulnerable to past known vulnerabilities and new zero-day attacks. The storage or application of data becomes at risk due to outdated operating systems.",
    recommendation: "Industry lead practices is to update client systems to at least Windows 10, or Windows Server 2016."
  },
  {
    name: "Microsoft .NET Framework Multiple Vulnerabilities",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application was possibly using an outdated .NET Framework version. Example: 1. Microsoft .NET Framework 4.0.30319",
    impact: "KPMG noted that the version used was susceptible to multiple vulnerabilities such as Cross Site Scripting (XSS), Denial of Service (DoS) attacks, and Execution Code Overflow.",
    recommendation: "It is recommended by the industry to update client systems to the latest Microsoft .NET Framework version."
  },
  {
    name: "Broken Access Control (Priveledge Escalation)",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application fails to properly enforce role-based access controls on backend resources. Although the user interface displays different tabs based on the user's role, multiple backend endpoints were accessible directly by low-privileged users through manual URL manipulation or crafted requests. For example, a normal user was able to escalate their privileges and gain access to functionalities intended for a CFO-level user.",
    impact: "Unauthorized users can access and perform actions on privileged pages, leading to potential data manipulation, privilege escalation, or exposure of sensitive information.",
    recommendation: "Implement strict server-side role-based access controls to ensure each user can only access web pages / functions appropriate to their role, regardless of URL manipulation or UI visibility."
  },
  {
    name: "Unauthenticated Access to PDF File",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that it was possible to access the uploaded PDF file without any authentication",
    impact: "Allowing unauthenticated access to sensitive or internal documents can lead to information leakage. Attackers or unauthorized users may gain access to confidential content, which could result in data exposure or misuse.",
    recommendation: "Enforce authentication checks on all files that are meant to be restricted. Access to documents should be validated based on user roles or permission, and direct links to sensitive files should not bypass security controls."
  },
  {
    name: "Improper Authentication Mechanism",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that there was no account lockout after an excessive amount of failed login attempts, thus a brute force attack is possible.",
    impact: "An attacker could gain unauthorized administrative access by systematically guessing the login attempt. This could lead to full system compromise, data theft, or disruption of services.",
    recommendation: `- Enforce strong password policies for all accounts and implement account lookout or rate-limiting mechanisms to prevent brute force attacks
    - Consider enabling Muti-Factor Authentication (MFA) for added security or locking an account after 3 to 5 consecutive failed login attempts`
  },
  {
    name: "Vulnerable Web Application Library (dojo)",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application uses and outdated and vulnerable version of: - dojo (x.x.x)",
    impact: "Vulnerable to prototype pollution and XXS, which may allow attackers to perform denial of service attacks, remote code execution, and property injection.",
    recommendation: `Update the following dojo version to:
    - At least 1.17.0`
  },
  {
    name: "Vulnerable Web Application Library (Jquery Validation)",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application is running a vulnerable and outdated version of: - Jquery Validation (x.x.x)",
    impact: "Older versions may lack security patches and be vulnerable to client-side validation bypasses or XSS via improperly escaped error messages.",
    recommendation: `Upgrade to the latest version: 1.21.0 
    This version includes security and compatibility improvements, including better support for modern browsers and frameworks.`
  },
  {
    name: "Vulnerable Web Application Library (Axios)",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application is running a vulnerable version of: - Axios (x.x.x)",
    impact: `Contains Cross-Site Request Forgery (CSRF) vulnerabilities, allowing attackers to modify attributes such as 'withCredentials' that may lead to an automatic insertion of X-XSRF-TOKEN headers for the attacker, potentially bypassing CSRF protections.
    Other vulnerabilities include SSRF, XSS, ReDOS, Prototype Pollution and etc.`,
    recommendation: "Update the Axios library to the latest non-vulnerable version, which is >= 0.28.0 / 1.10.0"
  },
  {
    name: "Vulnerable Web Application Library (Chart.JS)",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application uses and outdated and vulnerable version of: - Chart.js (x.x.x)",
    impact: "Vulnerable to prototype pollution which may allow attackers to perform denial of service attacks or remote code execution.",
    recommendation: `Update the following Chart.JS version to:
        - At least 2.9.4`
  },
  {
    name: "Vulnerable Web Application Library (highcharts)",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application uses an outdated and vulnerable version of: - highcharts (x.x.x)",
    impact: "Vulnerable to XSS and prototype pollution, increasing risk of client-side manipulation and data leakage.",
    recommendation: `Update the following jquery version to:
        - At least 3.5.0`
  },
  {
    name: "Vulnerable JS Library Detected Moment.js",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application is running an outdated version of: - Moment.js (x.x.x)",
    impact: "Affected versions of this package are vulnerable to Directory Traversal when a user provides a locale string which is directly used to switch moment locale.",
    recommendation: `Update the following Moment version to:
        - At least 2.29.4`
  },
  {
    name: "Vulnerable JS Library Detected JQuery.Stackatables",
    severity: "High",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application uses an outdated and vulnerable version of: - jquery.datatables (x.x.x)",
    impact: "Vulnerable to prototype pollution and XXS, which may allow attackers to perform denial of service attacks, remote code execution, and property injection.",
    recommendation: `Update the following jquery.datatables version to:
        - At least 1.11.3`
  },
  {
    name: "SSL Medium Strength Cipher Suites Supported (SWEET32)",
    severity: "High",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the server supports vulnerable medium strength cipher suites such as 3DES ciphers.",
    impact: "The DES Cipher is a 64-bit block cipher, and is vulnerable to the SWEET32 attack, which makes it easier for attackers to obtain cleartext data. (CVE-2016-2183).",
    recommendation: "Reconfigure the affected application with ciphers such as AES and to avoid using weak cipher suites such as 3DES."
  },
  {
    name: "Vulnerable Quest NetVault Backup Version",
    severity: "High",
    type: "Infra",
    observation: "During the assessment, KPMG noted that the NetVault Backup version is vulnerable and multiple exploits could be found online which make this vulnerability more easily to exploit",
    impact: "This version is vulnerable to Remote Code Execution which allow remote attacker to execute arbitary code. (CVE-1027-17417)",
    recommendation: "Upgrade to Quest NetVault Backup Server 11.4.5 or above."
  },
  {
    name: "Apache Tomcat AJP Connector Request Injection (Ghostcat)",
    severity: "High",
    type: "Infra",
    observation: "During the assessment, KPMG noted that the AJP connector was vulnerable to a file read/inclusion issues, this exploits is available publicly aka \"Ghostcat\".",
    impact: `This vulnerability (CVE-2020-1938) could lead to:
    1. Information Disclosure, returning arbitrary files from anywhere in the web application.
    2. Remote Code Execution, processing any file in the web application as a JavaScript Program.`,
    recommendation: `Upgrade Tomcat version to either or above:
      - version 7.0.100
      - version 8.5.51
      - version 9.0.31`
  },
  {
    name: "Vulnerable Oracle GlassFish Server",
    severity: "High",
    type: "Infra",
    observation: "During the assessment, KPMG noted that the version of Oracle Glassfish Server was vulnerable to remote code execution.",
    impact: "This vulnerabilities allows an unauthenticated, remote attacker to execute arbitrary code that could affect confidentiality, integrity, and availability. (CVE-2016-3607)",
    recommendation: "Upgrade to Oracle GlassFish Server version 3.1.2.15 or above"
  },
  {
    name: "Vulnerable Apache Tomcat Version",
    severity: "High",
    type: "Infra",
    observation: "During the assessment, KPMG noted that the Tomcat version is outdated, and it's exploits/vulnerabilities are well known, which makes the Apache server more vulnerable.",
    impact: `1. These versions are vulnerable to Remote Code Execution (CVE-2016-8735)
    2. Attacker could manipulates the HTTP response to poison the web-cache, perform XSS attack and obtain sensitive information (CVE-2016-6816)`,
    recommendation: `Upgrade Tomcat to latest version.
    Reference: https://tomcat.apache.org/`
  },
  {
    name: "Vulnerable Oracle WebLogic Version",
    severity: "High",
    type: "Infra",
    observation: "During the assessment, KPMG found that the version of Oracle WebLogic was vulnerable to Remote Code Execution.",
    impact: "This version of Oracle Weblogic contains a deserialization vulnerability that could lead to remote code execution without authentication. (CVE-2015-4852)",
    recommendation: `Upgrade the Oracle WebLogic to latest version (12.2.1.4).
    References:
    https://www.oracle.com/security-alerts/alert-cve-2015-4852.html`
  },
  {
    name: "Vulnerable VMware vCenter Server Version",
    severity: "High",
    type: "Infra",
    observation: "During the assessment, KPMG noticed that the VMware vCenter Server version is vulnerable to multiple vulnerabilities that are available publicly.",
    impact: `1. This version contains remote code execution vulnerability that allow attacker to execute commands with unrestricted privileges on the underlying operating system that hosts. (CVE-2021-21972)
    2. Improper validation of URL cause this version to contain an Server Side Request Forgery (SSRF) vulnerability that could lead to Information Disclosure. (CVE-2021-21973)`,
    recommendation: `Upgrade the VMware vCenter Server to 6.5U3n or above.
    References:
    https://www.vmware.com/security/advisories/VMSA-2021-0002.html`
  },
  {
    name: "Vulnerable VMware ESXi Version",
    severity: "High",
    type: "Infra",
    observation: "During the assessment, KPMG noticed that the VMware ESXi version is vulnerable to Cross-Site Scripting (XSS) attacks, which have been fixed and patched by the official vendor.",
    impact: "Improper validation of user inputs lead to cross-site scripting (XSS) vulnerability that could lead to unauthorized data modification or code execution. (CVE-2020-3955)",
    recommendation: `Update/Patch the version ESXi650-201912104-SG released by vendor.
    References:
    https://www.vmware.com/security/advisories/VMSA-2020-0008.html`
  },
  {
    name: "Vulnerable HP System Management Homepage Version",
    severity: "High",
    type: "Infra",
    observation: "During the assessment, KPMG noticed that the VMware ESXi version is vulnerable to multiple vulnerabilities that have been announced and addressed by official vendor.",
    impact: `1. This version contains flaws that could allow attacker to impact the confidentiality and integrity of the system. (CVE-2016-2015)
             2. Unauthenticated remote attacker could send crafted packet to cause denial-of-service or cause sensitive information leakage. (CVE-2015-3237)
             3. Improper validation of user input allows an unauthenticated remote user to launch denial-of-service attack or execution of arbitrary code. (CVE-2016-0705)`,
    recommendation: `Upgrade the HP System Management Homepage to version 7.5.5 or above.
    References:
    https://support.hpe.com/hpesc/public/docDisplay?docId=emr_na-c05111017`
  },
  {
    name: "Vulnerable ManageEngine ServiceDesk Plus Version",
    severity: "High",
    type: "Infra",
    observation: "During the assessment, KPMG noted that the ServiceDesk version is vulnerable to command injection.",
    impact: "This version of ServiceDesk using an incomplete list of disallowed inputs that cause Remote Code Execution, which allow remote attacker to execute arbitrary commands.",
    recommendation: "Upgrade to version 11.2 build 11205 or above."
  },
  {
    name: "OpenSSL < 1.1.1l Buffer Overflow",
    severity: "High",
    type: "Infra",
    observation: "During the assessment, KPMG noted that the OpenSSL version is vulnerable to Buffer Overflow.",
    impact: "OpenSSL version < 1.1.1l was identified to have Buffer Overflow issues, an attacker could send a crafted content to the server and cause the server to behaviour abnormally or cause the server to crash. (CVE-2021-3711)",
    recommendation: "Upgrade to latest OpenSSL version, currently latest was 1.1.1l"
  },
  {
    name: "Outdated PHP Version",
    severity: "High",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the web application is running with vulnerable PHP version (x.x.x).",
    impact: `The PHP version used is vulnerable to multiple medium to critical vulnerabilities. Identified version: PHP 7.3.7
        CVE-2019-11043: Remote code execution

        CVE-2019-13224,
        CVE-2020-7061: Heap Buffer Overflow

        CVE-2020-7062,
        CVE-2021-21702: Denial of Service (DoS)

        CVE-2020-7063: Insecure File Permissions

        CVE-2020-8169: Partial Password Disclosure

        CVE-2020-7064,
        CVE-2019-11041,
        CVE-2019-11042: Information Disclosure or crash

        CVE-2020-7065: Stack Buffer overflow

        CVE-2020-7066: Sensitive information disclosure

        CVE-2020-7067: Out of bound read vulnerability`,
    recommendation: `"Update to the latest PHP version.
                      The latest PHP version in 7.X branch is 7.4.22
                      https://www.php.net/ChangeLog-7.php"`
  },
  {
    name: "Outdated OpenSSH Version",
    severity: "High",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the infrastructure is running with vulnerable OpenSSH version (7.2 & 8.1).",
    impact: `The OpenSSH version used is vulnerable to multiple medium to critical vulnerabilities.
    Identified version:
    OpenSSH 7.2
    OpenSSH 8.1`,
    recommendation: `Upgrade to the latest OpenSSH version.
    The latest OpenSSH version is 9.0.
    References:
    https://www.openssh.com/releasenotes.html#9.0`
  },
  {
    name: "Directory Browsing",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that one of the web application's cookie was set with a path for \"/gisserver/rest/\", which leads to a directory listing page (https://smart.sdguthrie.com/gisserver/rest/) that is accessible even without authentication.",
    impact: "Exposes the internal file structures and potentially sensitive information compromising confidentiality.",
    recommendation: "Remove the observed path from the cookie if it is not required and implement proper authentication measures when accessing the observed path."
  },
  {
    name: "Missing \"Strict-Transport-Security\" Header",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the \"Strict-Transport-Security\" header is missing from the response headers.",
    impact: "Allows browsers to access the site over HTTP, making it vulnerable to SSL stripping attacks.",
    recommendation: "Configure the web server to include the \"Strict-Transport-Security\" header."
  },
  {
    name: "Absence of Anti CSRF Token",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application has no anti CSRF tokens implemented.",
    impact: "Introduces Cross-Site Request Forgery (CSRF) attacks, which allows an attacker to perform unauthorized actions on behalf of users.",
    recommendation: `Implement Anti-CSRF tokens in all sensitive forms such as login and forgot password to prevent unauthorized form submissions. To do this, generate a cryptographically secure random token for each user session or request. Use a secure random number generator (e.g., crypto.randomBytes in Node.js, secrets module in Python, or SecureRandom in Java). Associate the token with the user’s session (e.g., store it in the session object or database).`
  },
  {
    name: "Cookie without Secure Flag",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application's cookies does not have the \"Secure\" flag enabled: - xxx",
    impact: "Allows an attacker to access cookies via unencrypted connections.",
    recommendation: `Ensure the \"Secure\" flag is enabled for all cookies.

    For example in express.js: 
    app.get('/', (req, res) => {
      res.cookie('sessionID', '12345', {
        secure: true, // Set Secure flag
    });`
  },
  {
    name: "Invalid Emails Accepted for Registration",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application is accepting improperly formatted or non-existent email addresses without validation.",
    impact: "This can lead to fake or unreachable accounts, disrupt communication workflows, and increase the risk of spam or abuse of the system.",
    recommendation: "Implement both client-side and server-side email validation using regular expressions and domain verification. Consider using email verification links to confirm ownership before account activation."
  },
  {
    name: "Session Timeout",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application has User sessions that remain active indefinitely or for an extended period without automatic timeout due to inactivity.",
    impact: "This increases the risk of unauthorized access, especially on shared or public devices, potentially leading to session hijacking or data leakage.",
    recommendation: "Configure session timeout settings to automatically log users out after a period of inactivity (e.g., 15–30 minutes). Provide users with a warning before timeout and allow secure re-authentication."
  },
  {
    name: "Improper Session Termination",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application does not terminate the session properly even after the browser has been closed.",
    impact: "An unauthorized user who gains access to the same machine or browser instance may access the authenticated session without needing to log in. This can lead to exposure of sensitive information, impersonation, or unauthorized transactions.",
    recommendation: "Implement proper session handling that invalidates or clears session tokens when the browser is closed."
  },
  {
    name: "Insecure Page Caching",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application has page caching that is cached by the browser, and is not cleared. This means intermediary proxies make them accessible even after logout.",
    impact: "Cached pages can be retrieved using the browser’s back button or cache inspection, exposing sensitive information to unauthorized users.",
    recommendation: "Set appropriate HTTP headers such as Cache-Control: no-store, Pragma: no-cache, and Expires: 0 on sensitive pages. Ensure logout actions clear session data and redirect users to a non-cached page."
  },
  {
    name: "Concurrent Login Sessions",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application supports multiple concurrent logins. Two different computers can log-in to the same web application which is insecure.",
    impact: "Allowing multiple active sessions for a single user account increases the risk of session hijacking and unauthorized access. This makes it harder to track user activity and detect anomalies.",
    recommendation: "Limit the number of concurrent sessions per user, ideally only one login per session. Implement session management policies (e.g., auto-logout, session timeout)."
  },
  {
    name: "HTML Source Code Comments",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application has source code comments that leaked information about the web application's content. In this example, a hidden \"change password\" web page was found.",
    impact: "HTML source code comments may expose sensitive information (e.g., credentials, internal logic). This can aid attackers in understanding application structure and identifying weaknesses.",
    recommendation: "It is industry recommendation to remove all unnecessary comments from production code. This is to avoid including sensitive information in comments."
  },
  {
    name: "Apache Dashboard",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application's default home page was publicly available to access.",
    impact: "Public accessible default home pages discloses information about the server, providing the attacker extra visibility on the web application's technology and could leak further attack vectors for the attacker to leverage on.",
    recommendation: "Reconfigure the web application without the default server web page."
  },
  {
    name: "Weak Password Policy Allows Insecure User Credentials",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the supplied test user credentials are made up of weak password policies (wmu1234). This indicates that even if its not for assessment purposes, a user account can be created with very weak password policies.",
    impact: "Increased risk of account compromise and allow attackers unauthorized access to sensitive data.",
    recommendation: `1. Enforce a strong password policy:
      - Minimum 8-12 characters
      - At least one uppercase letter, one lowercase letter, one number, and one special character
      2. Consider implementing Multi-Factor Authentication (MFA)
      3. Provide user feedback on password strength during registration:
      - Password: password123 (TOO WEAK!)
    - Password: Fdow@934/ (STRONG!)`
  },
  {
    name: "SQL Query Error Disclosure",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application disclosed an SQL query error that exposes the name of the database.",
    impact: "Allows an attacker to use the exposed information to perform attacks using SQL injection.",
    recommendation: "Implement proper error handling to catch SQL exceptions and return generic messages to users."
  },
  {
    name: "Exposure of Unauthorised Functionalities in UI Navigation",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application exposes unauthorised functionalities the navigation bar of the custom error page.",
    impact: "Unauthorised users may view hidden navigation items that may be only meant for high priviledge users.",
    recommendation: "Review the navigation bar."
  },
  {
    name: "Exposed CMS Admin Interface (Moji5)",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the Moji5 web-based admin interface was found to be publicly accessible without any network-level restrictions. This was triggered when parameter (AppID) within the URL was modified.",
    impact: "An attacker with the knowledge of the tool could attempt unauthorized access, perform brute-force attacks, or exploit known vulnerabilities in the CMS, potentially leading to system compromise or defacement.",
    recommendation: "Restrict access to the Moji5 admin interface to internal IP addresses or via VPN only."
  },
  {
    name: "Insecure Persistent Authentication Cookie",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the authentication cookie (ZukamiLogin) was configured with a fixed expiration of 10 hours, allowing the session to persist across browser closures without requiring re-authentication.",
    impact: "May allow attackers to gain unauthorised access on shared or unattended devices, potentially affecting confidentiality and integrity.",
    recommendation: "Set the authentication cookie as a session cookie or implement logic to require re-authentication after browser is closed."
  },
  {
    name: "Improper Input Sanitization",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application accepted user input without proper sanitization or encoding, allowing potentially unsafe characters to be reflected or stored in the response.",
    impact: "Improper input sanitization can lead to injection-based vulnerabilities such as HTML injection or reflected XSS which may compromise confidentiality and integrity.",
    recommendation: "Apply contextual output encoding for all dynamic data rendered in the response, use strict server-side input validation and avoid reflecting unsanitized input back to users."
  },
  {
    name: "Internal IP Address Disclosure",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified an internal IP address (172.17.151.221) within the HTTP response.",
    impact: "Revealing internal IP addresses provides attackers with insight into the internal network structure, which can assist in further targeted attacks during a multi-stage compromise.",
    recommendation: "Ensure internal IP addresses are not exposed in any responses. Sanitize and review server-side debug messages, headers, and error responses to remove sensitive infrastructure details."
  },
  {
    name: "Potential XML Injection",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that a hidden field (ctl00%24ContentPlaceHolder1%24TabularList1%24hfOrderList) used in sorting or filtering is potentially vulnerable to XML injection.",
    impact: "Attackers may conduct XML structure tampering. Besides that, this could lead to potential privilege escalation or logic flaws if the XML is used for authorization decisions.",
    recommendation: "Implement server-side validation to reject unexpected input in hidden fields."
  },
  {
    name: "XSS Vulnerability Patch",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application was using an outdated version of WordPress W3 Total Cache plugin (2.1.1)",
    impact: "Authenticated and Stored Cross-Site Scripting (XSS) vulnerability was discovered by m0ze in WordPress W3 Total Cache plugin (versions <= 2.1.1).",
    recommendation: `It is recommended to update client systems with the latest available version WordPress W3 Total Cache plugin (at least 2.1.3).

    Reference: 
    https://www.wordfence.com/blog/2021/12/xss-vulnerability-patched-in-plugin-designed-to-enhance-woocommerce/
    https://wpscan.com/plugin/w3-total-cache`
  },
  {
    name: "HSTS Missing from HTTPS Server",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the server does not enforce HSTS.",
    impact: "Without HSTS, attackers might be able to perform downgrade attacks, man-in-the-middle attacks, SSL-striping, and cookie hijacking attacks.",
    recommendation: "Implement HSTS by adding the Strict-Transport-Security header with an appropriate max-age value to enforce secure connections."
  },
  {
    name: "Clickjacking",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the application lacked proper X-Frame-Options and Content-Security-Policy headers.",
    impact: "Clickjacking allows attackers to trick users into clicking hidden UI elements in a malicious frame, potentially leading to unauthorized actions.",
    recommendation: "Set X-Frame-Options to DENY or SAMEORIGIN, or use Content-Security-Policy: frame-ancestors to prevent unauthorized framing."
  },
  {
    name: "HTTP Method \"TRACE\" Allowed",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application allows the following HTTP Method: - TRACE",
    impact: "The HTTP TRACE method allows a client to send a request to the server, and have the same request sent back in the server's response. This allows the client to determine if the server is receiving the request as expected.",
    recommendation: "Block or return 405 Method Not Allowed for the specified HTTP requests unless explicitly needed and properly secured."
  },
  {
    name: "Insecure Cross-Origin Resource Sharing (CORS) Configuration",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application sets the response header Access-Control-Allow-Origin: *, allowing any domain to interact with it via cross-origin requests.",
    impact: "May allow malicious websites to make unauthorized requests to the web application and potentially access sensitive data, especially if cookies or credentials are not properly scoped.",
    recommendation: "Restrict CORS access by specifying only trusted domains in the Access-Control-Allow-Origin header."
  },
  {
    name: "Admin Page Publicly Accessible",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that an admin page was publicly accessible without any form of network-based access control.",
    impact: "Exposes the application to increased risk of unauthorized access attempts, such as brute-force attacks, credential stuffing, or exploitation of known vulnerabilities in the admin interface.",
    recommendation: "Limit access to the admin page by using network controls such as IP whitelisting."
  },
  {
    name: "XSS Vulnerability Patch",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application was using an outdated version of WordPress W3 Total Cache plugin (2.1.1)",
    impact: "Authenticated and Stored Cross-Site Scripting (XSS) vulnerability was discovered by m0ze in WordPress W3 Total Cache plugin (versions <= 2.1.1).",
    recommendation: `It is recommended to update client systems with the latest available version WordPress W3 Total Cache plugin (at least 2.1.3).
    Reference: 
    https://www.wordfence.com/blog/2021/12/xss-vulnerability-patched-in-plugin-designed-to-enhance-woocommerce/
    https://wpscan.com/plugin/w3-total-cache`
  },
  {
    name: "SSL Breach Attack",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified the \"gzip\" HTTP compression is vulnerable from a SSL Breach attack.",
    impact: `The HTTPS protocol, as used in web applications, encrypts compressed data without obfuscating the length of the unencrypted data, which makes it easier for man-in-the-middle attackers to obtain plaintext secret values by observing the length differences of data. Guesses of the HTTP request string is possible. For example, when a URL potentially matches an unknown string in an HTTP response body, it will allow the attacker to inject plaintext into a victims HTTP request. This is commonly called a "BREACH" attack. BREACH stands for (Browser Reconnaissance & Exfiltration via Adaptive Compression of Hypertext). Note, this is a different issue than CVE-2012-4929.

    BREACH Attacks allows an attacker to have the ability to:
    - Inject partially chosen plaintext into a victim's requests
    - Measuring the size of encrypted traffic
        can leverage information leaked by compression to recover targeted parts of the plaintext.`,
        recommendation: `Remediation lead practices is to implement the following solutions: 
    1. Mitigations to fix this include:
    2. Disabling HTTP compression
    3. Separating secrets from user input
    4. Randomizing secrets per request
    5. Masking secrets (effectively randomizing by XORing with a random secret per request) 
    6. Protecting vulnerable pages with CSRF
    7. Length hiding (by adding random number of bytes to the responses)
    8. Rate-limiting the requests
    Reference: http://www.breachattack.com/`
  },
  {
    name: "Application Error Message Disclose Sensitive Information",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the application contains an error/warning message that may disclose sensitive information. The message can also contain the location of the file that produced the unhandled exception and the version used.",
    impact: "The error message may disclose sensitive information. This information can be used to launch further attacks.",
    recommendation: "Industry lead practices is to modify the web page to not disclose details and information about the underlying web server and version."
  },
  {
    name: "Server Information Disclosure",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG found that an information disclosure vulnerability exists in the remote web server.",
    impact: "An attacker might use the disclosed software version information to research specific security vulnerabilities, which can then provide the attacker the opportunity to perform further attacks.",
    recommendation: `Industry lead practices is to modify the HTTP headers to not disclose details information about the underlying web server and version.
    References: 
    https://www.rapid7.com/blog/post/2019/12/06/hidden-helpers-security-focused-http-headers-to-protect-against-vulnerabilities/`
  },
  {
    name: "File Information Disclosure",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG found that an information disclosure vulnerability exists in the remote web server, from the information leakage of the web.config file.",
    impact: "The \"web.config\" file is vulnerable when it is unauthenticated. An attacker can exploit this via a simple GET request, to disclose potentially sensitive website configuration information.",
    recommendation: "Lead practices as defined by the industry, is to ensure proper restrictions are in place to view the \"web.config\" file, or remove the web.config file completely if the file is not required."
  },
  {
    name: "Multiple Web Applications Hosted on a Single Web Server",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG found that the server hosts multiple web applications within the same environment.",
    impact: "If these applications are not properly isolated, a compromise in one could lead to lateral movement or full server compromise.",
    recommendation: "Ensure strict isolation between applications."
  },
  {
    name: "E-Tag Information disclosure",
    severity: "Medium",
    type: "Web App",
    observation: "KPMG identified the remote web server is affected by an information disclosure vulnerability.",
    impact: "The remote web server is affected by an information disclosure vulnerability due to the \"Etag\" header providing sensitive information that could aid an attacker, such as the inode number of requested files.",
    recommendation: "Industry lead practices is to modify the HTTP ETag header of the web server to not include file inodes in the ETag header calculation."
  },
  {
    name: "Vulnerable JS Library Detected JQuery",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application is running an outdated version of: - Jquery (x.x.x)",
    impact: "Affected versions of Jquery (//) are vulnerable to Cross-site Scripting (XSS) and passing HTML elements containing <option> from untrusted sources. Despite sanitizing HTML elements, it is still possible to be attacked by one of jQuery's DOM manipulation methods (i.e. .html(), .append(), and others), which may result in an execution of untrusted code.",
    recommendation: `Update the following Jquery version to:
    - At least 3.5.0`
  },
  {
    name: "Vulnerable JS Library Detected Jquery-UI",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application uses an outdated and vulnerable version of: - jquery-ui (x.x.x)",
    impact: "Vulnerable to XSS and DOM manipulation, risking interface-based exploitation.",
    recommendation: `Update the following jquery-ui version to:
    - At least 1.13.2`
  },
  {
    name: "Vulnerable Library Detected Bootstrap",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application uses and outdated and vulnerable version of: - Bootstrap (x.x.x)",
    impact: "Contains Cross-Site Scripting (XSS) vulnerabilities, allowing attackers to inject malicious scripts via the data-template and data-parent attributes, which can compromise user data and session integrity.",
    recommendation: `Update the following Bootstrap version to:
    - At least 5.0.0`
  },
  {
    name: "TLS Version 1.0 Protocol Detected",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the server has TLS Version 1.0 Protocol enabled.",
    impact: "This TLS version is outdated and uses weak cipher suites, making it easy for attackers to decrypt encrypted data. Additionally, this TLS version is susceptible to attacks such as POODLE attack and BEAST attack which allow attackers to compromise secure connections.",
    recommendation: "Disable TLS Version 1.0 and enable TLS Version of at least 1.2 and above."
  },
  {
    name: "TLS Version 1.1 Protocol Detected",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the server has TLS Version 1.1 Protocol enabled.",
    impact: "This TLS version is outdated and uses weak cipher suites, making it easy for attackers to decrypt encrypted data. Additionally, this TLS version is susceptible to attacks such as POODLE attack and BEAST attack which allow attackers to compromise secure connections.",
    recommendation: "Disable TLS Version 1.1 and enable TLS Version of at least 1.2 and above."
  },
  {
    name: "TLS Version 1.2 Weak Ciphers Enabled",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the server has TLS Version 1.2 Protocol enabled with ciphers less than 2048 bits.",
    impact: "While TLS Version 1.2 is sufficiently secure for most servers, but the use of weaker ciphers makes it easy for attackers to decrypt encrypted data, causing possible leakage of sensitive data.",
    recommendation: "Reconfigure the affected server with ciphers like AES that have at least 2048 bits."
  },
  {
    name: "SSH Terrapin Prefix Truncation Weakness",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the server has the encryption algorithms, \"chacha20-poly1305@openssh.com\" and multiple \"*-etm@openssh.com\" enabled.",
    impact: "With \"chacha20-poly1305@openssh.com\" and \"*-etm@openssh.com\" related encryption algorithms enabled, it is possible for attackers to perform Terrapin attack, which is a man-in-the-middle prefix truncation weakness. It allows a remote attacker to bypass integrity checks and downgrade the security of the connection.",
    recommendation: "Disable \"chacha20-poly1305@openssh.com\" and other \"*-etm@openssh.com\" related encryption algorithms in SSH configurations, and update SSH software to versions that fix this vulnerability."
  },
  {
    name: "SSL/TLS Certificate Expiry",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the server's SSL and TLS certificates have expired.",
    impact: "Expired TLS and SSL certificates may cause browsers to display security warnings, reducing user trust and potentially blocking access.",
    recommendation: "Set up certificate expiration alerts, automate certificate renewal, and regularly audit certificates to prevent unexpected expiration."
  },
  {
    name: "SSL Version 2 and 3 Protocol Detected",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the server has SSL Version 3 Protocol enabled.",
    impact: "SSL Version 3 is susceptible to attacks such as POODLE attack and BEAST attack, which may be exploited through man-in-the-middle attack, allowing attackers to decrypt and extract data from encrypted communications.",
    recommendation: "Disable SSL Version 3 and enable TLS Version of at least 1.2 and above."
  },
  {
    name: "Terminal Services Doesn't Use Network Level Authentication (NLA) Only",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the remote Terminal Services does not mandate the use of Network Level Authentication (NLA) only.",
    impact: "If Terminal Services supports NLA alongside other weaker authentication methods, it increases security risks. Weaker methods lack the robust protection of NLA, makes the server more vulnerable to attacks like man-in-the-middle, brute force, or unauthorized access. This mixed support can enable attackers to exploit outdated protocols, compromising data integrity and confidentiality.",
    recommendation: "Recommend to mandate Network Level Authentication (NLA) only on the remote RDP server."
  },
  {
    name: "Misconfigured SSL Certificate",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG identified that there is a misconfiguration within the SSL certificate: - commonName mismatch",
    impact: "A misconfigured SSL certificate undermines the trust and confidentiality guarantees of HTTPS. As a result, users are vulnerable to man-in-the-middle (MITM) attacks, where attackers can intercept or modify traffic.",
    recommendation: "Issue a new SSL certificate specifically for the intended internal hostname to ensure proper domain validation and eliminate certificate mismatch warnings."
  },
  {
    name: "TLS Fallback SCSV Not Supported",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the server does not support the TLS_FALLBACK_SCSV (TLS Signaling Cipher Suite Value), a mechanism designed to prevent downgrade attacks during the TLS handshake process.",
    impact: "Attackers could force a weaker TLS version (such as TLS 1.0 or TLS 1.1), which is more susceptible to various attacks (BEAST / POODLE).",
    recommendation: "Disable TLSv1.0 and TLSv1.1."
  },
  {
    name: "nginx < 1.17.7 Information Disclosure",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG noted that the remote web server is affected by an information disclosure vulnerability.",
    impact: "According to it's Server response header, the installed version of nginx is prior to 1.17.7. Therefore, it is affected by an information disclosure vulnerability.",
    recommendation: "It is best practice as defined by the industry standards, to upgrade to nginx version 1.17.7 or later."
  },
  {
    name: "Weak Cipher Suites",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG identified that weak cipher suites are supported.",
    impact: `Medium cipher suites supported
    CVE-2016-2183: Vulnerable to birthday attack (SWEET32 attack)
    CVE-2017-15326: Unauthenticated remote attacker can exploit this vulnerability to crack the encrypted data and cause information leakage
    SSL RC4 cipher suites supported (Bar Mitzvah)
    CVE-2013-2566: Vulnerable to plaintext-recovery attacks via statistical analysis`,
    recommendation: "It is best practice as defined by the industry standards, to reconfigure the affected application if possible to avoid the use of weak cipher suites."
  },
  {
    name: "Network Time Protocol (NTP) Mode 6 Scanner",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the remote NTP server responds to mode 6 queries.",
    impact: "An attacker could perform Man-in-the-middle attack and observe the information flow between the network traffic.",
    recommendation: "Disable TLSv1.0, use TLSv1.2 or above."
  },
  {
    name: "F5 BIG-IP Cookie Remote Information Disclosure",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG identified that BIG-IP Cookie can be extracted and decoded to internal IP.",
    impact: `Internal IP has been disclosed, due to BIG-IP cookie being decoded. The IP address obtained from the cookie could provide the attacker more information about the system and perform further attacks.
    Example. Cookie:BIGipServerWEbCorp_443=371332106.47.873.0000 is decoded to obtain 10.10.34.21:443.`,
    recommendation: `Configure the BIG-IP LTM system to encrypt HTTP cookies before sending them to the client system. The BIG-IP LTM system can encrypt BIG-IP persistence cookies (which are inserted by BIG-IP), as well as cookies that are embedded in the response from the server. In addition, it is recommended to configure the BIG-IP LTM system to encrypt cookies to keep information private, even if the cookie contains sensitive information about the web application.
    Reference: https://support.f5.com/csp/article/K14784`
  },
  {
    name: "Outdated ASP.NET Version",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG identified that vulnerable ASP.NET version (4.0.30319) is in use.",
    impact: `CVE-2011-3416: The Forms Authentication feature in the ASP.NET subsystem in Microsoft .NET Framework allows remote authenticated users to obtain access to arbitrary user accounts via a crafted username, aka "ASP.Net Forms Authentication Bypass Vulnerability."
    As the disclosed version could potentially be folder name instead of the exact ASP.NET version we have raised this issue as low risk. If the identified ASP.NET version is outdated, then this might be vulnerable to multiple critical and high risk issues which would require immediate attention.`,
    recommendation: `Install and apply security updates provided by Microsoft for ASP.NET, using update management software, or by checking for updates manually using the Microsoft Updates.
    Source: https://docs.microsoft.com/en-us/security-updates/SecurityBulletins/2011/ms11-100?redirectedfrom=MSDN`
  },
  {
    name: "OpenSSL HeartBeat Information Disclosure (Heartbleed)",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG detected the hosts are vulnerable to Heartbleed, which could be exploit easily by using online resources.",
    impact: "An attacker could send crafted packets to the server to trigger a buffer over-read, and hence able to obtain potential sensitive information. (CVE-2014-0610)",
    recommendation: `1. Upgrade to OpenSSL 1.0.1g or above.
    2. Recompile OpenSSL with "-DOPENSSL_NO_HEARTBEATS" flag.`
  },
  {
    name: "Default Unsecured Account for PostgreSQL",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG detected that the PostgreSQL server is accessible by using the default username without any password provided.",
    impact: "An attacker is able to connect to the PostgreSQL database server using the default unsecure account, which could lead to further attacks against the database.",
    recommendation: `Set up a password for all of the accounts connected to the Postgres SQL database.
References:
    https://serverfault.com/questions/836368/postgresql-default-unpassworded-account`
  },
  {
    name: "Unencrypted Telnet Server",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG noted that the Telnet Server is running on unencrypted channel.",
    impact: "Using Telnet over an unencrypted channel is not recommended, because login credentials, passwords, and commands are transmitted over the network in plaintext. This allows an attacker to perform man-in-the-middle attacker to eavesdrop on a Telnet session to obtain credentials or other sensitive information and to modify traffic exchanged between a client and server.",
    recommendation: "Remediation based on defined industry standards is to disable the Telnet service and exclusively use SSH services instead."
  },
  {
    name: "Unencrypted Telnet Server",
    severity: "Medium",
    type: "Infra",
    observation: "During the testing KPMG detected that the host is running telnet service over an unencrypted channel. The Telnet protocol is obsolete and insecure, because it transmits data in plaintext.",
    impact: "Telnet transmits data in plaintext, which allows remote attacker to observe, capture even modify the information flow within the traffic.",
    recommendation: "Remediation based on defined industry standards is to disable the telnet service completely and use SSH instead."
  },
  {
    name: "Vulnerable IBM WebSphere Application Server Version",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG noticed that the version of IBM WebSphere Application Server could lead to Information Disclosure that have been announced and addressed by official vendor.",
    impact: "This version is vulnerable to directory traversal, which allow an attacker to view arbitrary files by crafting the URL to the system. (CVE-2021-20354).",
    recommendation: `Upgrade to minimal fix pack levels as required by interim fix and then apply Interim Fix PH33648
    OR
    Apply Fix Pack 8.5.5.20 or later.
    References:
    https://www.ibm.com/support/pages/node/6415959`
  },
  {
    name: "Server Information Disclosure",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the server software version is leaked.",
    impact: "The potential risk is that the attacker craft an attack from a known vector, based on the vulnerability of the existing server version, and perform a sophisticated attack.",
    recommendation: "It is recommended to hide server-side information from the front-end facing website, to prevent the server version being disclosed to the attacker."
  },
  {
    name: "SMB Signing not required",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG identified that signing is not required on the remote SMB server.",
    impact: "Signing is not required on the remote SMB server. An unauthenticated, remote attacker can exploit this to conduct man-in-the-middle attacks against the SMB server.",
    recommendation: "Enforce message signing in the host's configuration. On Windows, this is found in the policy setting 'Microsoft network server: Digitally sign communications (always)'. On Samba, the setting is called 'server signing'."
  },
  {
    name: "Apache Tomcat Default Files",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG noted that the hosts are using Apache Tomcat default pages, including error landing page.",
    impact: "These default pages configured by Apache Tomcat should only be visible to admins. The default pages could expose potential sensitive/valuable information on the server. An attacker could utilize these information to further exploit the system.",
    recommendation: `Remove unnecessary default pages, and replace/modify default error landing page.
    References:
    https://community.safe.com/s/article/FME-Server-Apache-Tomcat-Vulnerability-with-Default-Files`
  },
  {
    name: "Network Time Protocol Daemon (NTPD) \"monlist\" Command Enabled",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG noted that the NTP daemon was running on the host, and has enabled the command \"monlist\". This command \"monlist\" could lead to denial-of-service where the exploit code could be found online easily.",
    impact: `The monlist command will return a list of recent connected hosts, this could lead to Information Disclosure.
    "monlist" also allows remote attackers to cause a denial of service (DoS) attack by forging the monlist requests. (CVE-2013-5211)`,
    recommendation: `Disable to monlist feature by adding "disable monitor" to the ntp.conf then restart the ntp service.
    References:
    https://help.fasthosts.co.uk/app/answers/detail/a_id/2153/~/what-is-ntp-and-how-do-i-make-it-secure%3F`
  },
  {
    name: "Terminal Services Encryption Level is Medium",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG noted that the hosts is using \"Client Compatible\" level as the RDP Encryption Level, this level is not secure enough to prevent attacks like eavesdropping.",
    impact: "This encryption level is depends on maximum key strength supported by the client. If client using weak cryptography may allow an attacker to eavesdrop the communication more easily.",
    recommendation: "Set the encryption level to High or FIPS Compliant."
  },
  {
    name: "Microsoft Windows Remote Desktop Protocol Server Man-in-the-Middle Weakness",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the host is using the remote version of the Remote Desktop Protocol Server (Terminal Service) which is vulnerable to a man-in-the-middle (MiTM) attack.",
    impact: "The RDP client makes no effort to validate the identity of the server when setting up encryption. An attacker with the ability to intercept traffic from the RDP server can establish encryption with the client and server without being detected. A MiTM attack of this nature would allow the attacker to obtain any sensitive information transmitted, including authentication credentials.",
    recommendation: "Force the use of SSL/TLS as a transport layer for this service if supported, or/and select the Allow connections only from computers running Remote Desktop with Network Level Authentication setting if it is available."
  },
  {
    name: "Terminal Services Encryption Level is Medium",
    severity: "Medium",
    type: "Infra",
    observation: "During the assessment, KPMG noted that the hosts is using \"Client Compatible\" level as the RDP Encryption Level. This level is not secure enough to prevent attacks like eavesdropping.",
    impact: "This encryption level is depends on maximum key strength supported by the client. If client using weak cryptography, it will allow an attacker to eavesdrop the communication with ease due to the lack of complexity.",
    recommendation: "Remediation and lead practices defined by the industry, is to apply the best possible encryption standard for all devices. Set the encryption level to High or FIPS Compliant."
  },
  {
    name: "Insecure Data Storage",
    severity: "Medium",
    type: "Mobile",
    observation: "During the assessment, it is noted that the mobile application is storing the data insecurely. It was observed that the username and other details were stored in plain text.",
    impact: `Business Impact: Attacker could use the insecure data storage to retrieve sensitive information, it may lead to Identify Theft.
    Technical Impact: Attacker could steal sensitive information and perform further phishing attacks.`,
    recommendation: "Remediation and lead practices defined by the industry, to not store usernames and passwords in plaintext. This is to prevent the attacker to obtain the credentials with ease. For this case, remediation is to hash the stored data multiple times to increase complexity."
  },
  {
    name: "Improper QR Data Encryption",
    severity: "Medium",
    type: "Mobile",
    observation: "During the assessment, we noted that the mobile application is handling transmission of the details from spoofed QR code and accepting the transaction. It was observed that info used within the QR code were not properly obfuscated or handled.",
    impact: `Business Impact: Attacker could use the insecure data to retrieve sensitive information, it may lead to Identify Theft.
    Technical Impact: Attacker could steal sensitive information and perform further exploitation.`,
    recommendation: "Remediation and lead practices defined by the industry, is to hash and obfuscate the sensitive information being stored."
  },
  {
    name: "Potentially Hardcoded Data",
    severity: "Medium",
    type: "Mobile",
    observation: "During the assessment, it was observed that the encryption key has been hardcoded.",
    impact: "Leaked encryption keys can be used to create additional attacks.",
    recommendation: `Remediation and lead practices defined by the industry, is to encrypt and store any sensitive data in the application.
    Reference: https://www.netguru.com/blog/hardcoded-keys-storage-mobile-app`
  },
  {
    name: "Application Uses Weak Hashing Algorithms",
    severity: "Medium",
    type: "Mobile",
    observation: "During the assessment, it was noted that the mobile application’s is using multiple weak algorithms for encryption.",
    impact: `Business Impact: Attackers could easily retrieve and modify the transfer information to plan for further attack or gain access to the application.
    Technical Impact: SHA1, AES, DES is considered as a weak cipher. An attacker could retrieve and modify the data from the weak ciphers and to gain access to the application.`,
    recommendation: "Remediation and lead practices as defined by the industry, is to sign the certificate using a stronger algorithm such as SHA256, AES256."
  },
  {
    name: "Sensitive Information Disclosure via Error Page",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that web application displayed unhandled runtime errors with detailed exception messages or stack traces.",
    impact: "Revealing stack traces and technology version information can assist attackers in fingerprinting the application, potentially tailoring version-specific attacks based on the exposed data.",
    recommendation: "Implement custom error pages and ensure that technology and version information is not disclosed in error responses."
  },
  {
    name: "HTTP Options Method Allowed",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application allows the following HTTP Method: - OPTIONS",
    impact: "Allows an attacker to know what other HTTP methods are running on the server.",
    recommendation: "Block or return 405 Method Not Allowed for the specified HTTP requests unless explicitly needed and properly secured."
  },
  {
    name: "Missing \"X-XSS-Protection\" Header",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the \"X-XSS-Protection\" header is missing from the response headers.",
    impact: "Without the header, it increases the risk of Cross-Site Scripting (XSS) attacks. The header instructs the browser on how to handle detected XSS attacks by enabling or disabling its XSS filter or specifying how to respond when an attack is detected. The XSS filter compares incoming request data (e.g., query parameters) with the response content to identify potential script injections.",
    recommendation: "Reconfigure the web server to include the \"X-XSS-Protection\" header."
  },
  {
    name: "Missing \"X-Content-Type-Options\" Header",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the X-Content-Type-Options Header is missing from the response headers.",
    impact: "Allows the web application to be exposed to MIME-sniffing attacks and Cross-Site Scripting (XSS). Attackers can upload malicious files (e.g., a script disguised as an image) that the browser misinterprets as executable content, leading to XSS or code execution.",
    recommendation: "Reconfigure the web server to include the \"X-Content-Type Options\" header with value \"nosniff\"."
  },
  {
    name: "Missing \"X-Frame-Options\" Header",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the X-Frame-Options (anti-clickjacking) header is missing from the response headers.",
    impact: "Attackers can overlay a malicious webpage over a legitimate site, tricking users into performing unintended actions (e.g., clicking a button to transfer funds).",
    recommendation: "Reconfigure the web server to include the \"X-Frame-Options\" header with the value \"DENY\"."
  },
  {
    name: "Missing \"Content-Security-Policy\" (CSP) Header",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the \"Content-Security-Policy\" (CSP) header is missing from the response headers.",
    impact: "Allows an attacker to inject malicious code such as malicious scripts injected via user input, which ultimately leads to XSS attacks and data theft.",
    recommendation: "Reconfigure the web server to include the CSP header along with its relevant attributes."
  },
  {
    name: "Missing \"X-Permitted-Cross-Domain-Policies\" Header",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the \"X-Permitted-Cross-Domain-Policies\" header is missing from the response headers.",
    impact: "Increases the risk of data theft via unauthorized cross-domain access. For example, plugins like Flash or Acrobat Reader could load sensitive resources from your site in a malicious context.",
    recommendation: "Reconfigure the web server to include the \"X-Permitted-Cross-Domain-Policies\" headers."
  },
  {
    name: "Missing \"Expect-CT\" Header",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the \"Expect-CT\" header is missing from the response headers. The purpose of the Expect-CT header is to enforce Certificate Transparency (CT), which is to ensure SSL/TLS certificates are logged and verifiable, preventing the use of fraudulent certificates.",
    impact: "Increases the risk of Man-In-The-Middle (MITM) attacks. Attackers could use rogue certificates to impersonate, intercepting sensitive data.",
    recommendation: "Reconfigure the web server to include the \"Expect-CT\" headers."
  },
  {
    name: "Missing \"Cross-Origin-Opener-Policy\" Header",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the \"Cross-Origin-Opener-Policy\" header is missing from the response headers. The purpose of the header is to control whether a window can share its browsing context with other windows (e.g., popups), mitigating attacks and cross-origin data leaks.",
    impact: "Increase to risk of data exposure and complicate browser interactions. For example, Malicious sites could access your site’s window object via popups, potentially exploiting CPU vulnerabilities (e.g., Spectre) to steal data.",
    recommendation: "Reconfigure the web server to include the \"Cross-Origin-Opener-Policy\" headers."
  },
  {
    name: "Missing \"Referrer-Policy\" Header",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the \"Referrer-Policy\" header is missing from the response headers. The purpose of the Referrer-Policy header is to control how much information about the referring page (URL) is sent in the Referer header when users click links or load resources.",
    impact: "Sensitive information contained in the URL will be leaked to the cross-site. For example, sensitive data in URLs (e.g., session tokens, query parameters) could be sent to third-party sites or logged in server logs.",
    recommendation: "Reconfigure the web server to include the \"Referrer-Policy\" headers."
  },
  {
    name: "Web App Leaks Information via \"Server\" HTTP Response Header",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application leaks information via the \"Server\" HTTP Response Header: - xxx",
    impact: "Allows an attacker to retrieve more information about a target.",
    recommendation: "Remove the \"Server\" header."
  },
  {
    name: "Web App Leaks Information via \"X-AspNet-Version\" HTTP Response Header",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application leaks information via the \"X-Aspnet-Version\" HTTP Response Header: - x.x.x",
    impact: "Allows an attacker to retrieve more information about a target.",
    recommendation: "Remove the \"X-AspNet-Version\" header."
  },
  {
    name: "Cookie without SameSite Attribute",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application's cookies does not have the \"SameSite\" flag enabled: - xxx",
    impact: "Allows the session cookie to be sent in cross-site requests, increasing the risk of Cross-Site Request Forgery (CSRF) attacks.",
    recommendation: "Ensure the \"SameSite\" attribute is set to Strict or Lax."
  },
  {
    name: "Web App Leaks Information via \"X-Powered-By\" HTTP Response Header",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application leaks information via the \"X-Powered-By\" HTTP Response Header: - xxx",
    impact: "Allows an attacker to retrieve more information about a target.",
    recommendation: "Remove the \"X-Powered-By\" header."
  },
  {
    name: "Cookie HTTPOnly Flag",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application is missing the HTTPOnly flag on the web app's cookies.",
    impact: "The HttpOnly flag prevents client-side scripts (like JavaScript) from accessing the cookie. The absence of the HTTPOnly flag on the web application's cookies means that the cookies become accessible to any script running in the browser, increasing the risk of exploitation. Potentially vulnerable to Cross-Site-Scripting (XSS) vulnerabilities.",
    recommendation: "Configure the remote web applications cookies with the HTTPOnly Flag."
  },
  {
    name: "File Upload Extension Vulnerability",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application is vulnerable to a file upload extension vulnerability. Where the application accepts \"double extensions\" for the web applications file upload function.",
    impact: "When the file upload function is not validated, double file extensions such as 'php.pdf' will be accepted and potentially run the malicious code inside the .php file.",
    recommendation: "Reconfigure the application to validate and sanitize the file upload function. Removing dangerous file extensions such as .php, .exe and more."
  },
  {
    name: "Old Password Reuse (Changing Passwords)",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application allows the reuse of old/existing passwords, when performing a password change.",
    impact: "The absence of password validation means that a user can constantly use the same password. This could lead to identity theft, increased risk to data breaches and account takeovers. It is also recommended to request users to change passwords periodically.",
    recommendation: "Configure the web application to not accept the reuse of old/existing passwords."
  },
  {
    name: "Unauthorised Access to Web Pages",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that through the server's directory list, it is possible to access some webpages without authentication.",
    impact: "An attacker may utilise this access to exploit the input fields in the web pages which may reveal sensitive data or may provide access to the server for the attackers.",
    recommendation: "It is recommended to restrict the access by unauthorised users to these webpages through redirecting to login page as done in the rest of the pages."
  },
  {
    name: "Possible Unwanted Page",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified multiple possibly unwanted webpages via directory enumeration.",
    impact: "Attackers could use these pages to gain insights into application structure or exploit unintended functionalities.",
    recommendation: "Remove these unwanted web pages."
  },
  {
    name: "Sensitive Information Disclosure",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application renders a message that exposes internal configuration logic. Example: Sorry, Web.config ShowForgotPasswordLink is set to 0",
    impact: "Leaks implementation logic and internal configuration.",
    recommendation: "Create error handling pages instead, but highly recommend to remove the web pages if not used."
  },
  {
    name: "Sensitive Information Disclosure via Error Page",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified the web application exposes sensitive details, including full stack traces and version information (Microsoft .NET and ASP.NET), within the error pages.",
    impact: "Revealing stack traces and technology version information can assist attackers in fingerprinting the application, potentially tailoring version-specific attacks based on the exposed data.",
    recommendation: "Implement custom error pages and ensure that technology and version information is not disclosed in error responses."
  },
  {
    name: "Information Disclosure through Directory Listing",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, it is discovered that the information disclosed through the directory listing which are from dependencies such as \"Test Form\" and \"Calendar\". Directory involved as follows: 1. /test.html 2. /calendar.aspx",
    impact: "The sensitive information may contain valuable information on its own (such as a password), or it may be useful for launching other more deadly attacks. If an attack fails, an attacker may use error information provided by the server to launch another more focused attack.",
    recommendation: "Industry lead practices, is to ensure that error messages only contain minimal details that are useful to the intended audience, and nobody else. The messages need to strike the balance between being too cryptic and not being cryptic enough. They should not necessarily reveal the methods that were used to determine the error. Such detailed information can be used to refine the original attack to increase the chances of success."
  },
  {
    name: "Insecure Page Caching (Pages Accessible via Browser Back Button)",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that it was possible to backtrack to webpages that require authentication via the browser back button due to page caching.",
    impact: "Potential data leakage on shared or public computers.",
    recommendation: "Implement proper cache control headers to prevent sensitive pages from being stored in the browser cache."
  },
  {
    name: "TLS Renegotiation Vulnerability",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified TLS Secure Renegotiation unsupported.",
    impact: "The vulnerability allowed for man-in-the-middle (MITM) attack, where chosen plain text could be injected as a prefix to a TLS connection. This vulnerability however, did not allow an attacker to decrypt or modify the intercepted network communication once the client and server have successfully negotiated a session between themselves.",
    recommendation: `Industry lead practices is to ensure that servers not permit legacy renegotiation.
    Source:
    https://datatracker.ietf.org/doc/html/rfc5746#section-4.1`
  },
  {
    name: "Microsoft IIS Default Index Page",
    severity: "Low",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the Microsoft IIS default page is accessible.",
    impact: "The remote web server displays the default Microsoft IIS index page. This page may contain some sensitive data like the server root and installation paths. This could potentially leak useful information about the server installation to a remote, unauthenticated attacker.",
    recommendation: "Disable IIS default page from the web server."
  },
  {
    name: "Nginx Server Version Outdated and Unsupported",
    severity: "Low",
    type: "Infra",
    observation: "During the assessment, KPMG observed that the web application is vulnerable due to the outdated and unsupported Nginx server version 1.21.0.",
    impact: "Exposes the server to known vulnerabilities, increasing risk of compromise through unpatched exploits.",
    recommendation: "Reconfigure the application with an updated version of Nginx server that is currently supported, which is 1.2.7 and above."
  },
  {
    name: "SSH Weak Key Exchange Algorithms Enabled",
    severity: "Low",
    type: "Infra",
    observation: "During the assessment, KPMG identified the use of weak key exchange algorithms in the servers, such as: - diffie-hellman-group1-sha1 - diffie-hellman-group1-exchange-sha1",
    impact: "Weak key exchange ciphers such as diffie-hellman-group1-sha1 and diffie-hellman-group1-exchange-sha1 allows attackers to potentially recover session keys and modify traffic. This could lead to information disclosure and compromise of secure communications.",
    recommendation: "Disable these key exchange algorithms in the servers."
  },
  {
    name: "SSH Weak MAC Algorithms Enabled",
    severity: "Low",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the server has enabled \"hmac-md5\", which is a weak MAC algorithm.",
    impact: "The use of HMAC with MD5 hash function is considered vulnerable as it may allow attackers to compromise data integrity and authentication.",
    recommendation: "Reconfigure the affected server with MAC algorithms with stronger hash functions such as HMAC with SHA-256 hash function."
  },
  {
    name: "SSH Server CBC Mode Ciphers Enabled",
    severity: "Low",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the server uses encryption algorithms with CBC mode.",
    impact: "CBC mode ciphers are vulnerable to decryption attacks, allowing attackers to obtain plain text messages.",
    recommendation: "Disable all CBC encryption and enable encryption algorithms with more secure modes such as CTR or GCM."
  },
  {
    name: "SSL Certificate Chain Contains RSA Keys Less Than 2048 bits",
    severity: "Low",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the X.509 certificate chain used contains certificates with RSA keys shorter than 2048 bits.",
    impact: "An X.509 certificate chain containing RSA keys less than 2048 bits poses a security risk as it weakens the encryption used to protect data in transit. This vulnerability makes it possible for attackers to break the encryption, potentially exposing sensitive information like login credentials or personal data.",
    recommendation: "Replace the certificate in the chain with a longer key (ex. 2048 bits), and reissue any certificates signed by the old certificate."
  },
  {
    name: "RC4 Encryption Algorithm Enabled",
    severity: "Low",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the server uses RC4 encryption algorithms.",
    impact: "RC4 encryption uses the same key for multiple encryptions which may allow attackers to analyse its encryption patterns and recover sensitive data through decrypting cipher text.",
    recommendation: "Disable RC4 encryption algorithms in the server."
  },
  {
    name: "SSL Vulnerabilities",
    severity: "Low",
    type: "Infra",
    observation: "During the assessment, KPMG noted that the SSL implementation was susceptible to vulnerabilities such as: 1. Potential LUCKY13 attack due to the CBC ciphers offered",
    impact: "The remote host supports the use of a weak cipher in one or more cipher suites. An attacker can perform a Man-in-the-middle-attack (MiTM) by intercepting the line or monitoring the network traffic and capturing the encrypted data, and due to the weak cipher, the attacker can crack the encrypted data and obtain access to the data in clear text. Thus, resulting in disclosure of the secret text, such as secure HTTPS cookies, and possibly resulting in the hijacking of an authenticated session.",
    recommendation: `Remediation involves using only strong ciphers to ensure secure communication.
    1. LUCKY13: Avoid using cipher block chaining (CBC) ciphers with TLS.`
  },
  {
    name: "NTP Mode 6 Vulnerability",
    severity: "Low",
    type: "Infra",
    observation: "During the assessment, KPMG identified that the Network Time Protocol (NTP) Server responds to Mode 6 queries, which may result in a DDoS attack.",
    impact: "“Mode 6” commands allow NTP to be reconfigured. Since NTP uses UDP communication which does not have the \"hand-shake\" communication, a DDoS attack can occur when the attacker sends requests to MANY NTP servers, forming a “bot-net”, which can then overwhelm a victim's computer.",
    recommendation: `Restrict NTP mode 6 Scanner. Upgrade to the latest NTP server version and secure it
    Source: https://ntp.org`
  },
  {
    name: "Echo Service Enabled",
    severity: "Low",
    type: "Infra",
    observation: "During the assessment, KPMG noted that the echo service is enabled on the host. This echo service itself was considered as a vulnerability (CVE-1999-0635) and shall be disable if not required",
    impact: "The echo service will echoes any data which is sent to it, an attacker could cause denial-of-service by spoofing data and sent to the victim. (CVE-1999-0103)",
    recommendation: `Disable echo service if not required.
    References:
    https://exchange.xforce.ibmcloud.com/vulnerabilities/44`
  },
  {
    name: "Quote of the Day (QOTD) Service Enabled",
    severity: "Low",
    type: "Infra",
    observation: "During the assessment, KPMG had discovered that the quote service (QOTD) is running on this host.",
    impact: "An attacker could launch \"ping pong\" attack against QOTD enabled hosts, this is a denial of service attack which will slow down the machines and saturating the network.",
    recommendation: "Disable QOTD service if not required."
  },
  {
    name: "Multiple Version Disclosures",
    severity: "Low",
    type: "Infra",
    observation: "During the assessment, KPMG identified multiple version disclosures.",
    impact: "An attacker gains access to sensitive information which may be used to launch further exploits against the application, or which may be of direct value.",
    recommendation: "Remediation and lead practices defined by the industry, is to configure the web server to prevent information leakage from the server."
  },
  {
    name: "Weak Encryption",
    severity: "Low",
    type: "Mobile",
    observation: "During the assessment, it was observed that the application uses weak encryption.",
    impact: "Weak encryption algorithms make data storage and transmission used by the mobile applications vulnerable to credential harvesting.",
    recommendation: "Remediation and lead practices defined by the industry, is to use stronger well known encryption algorithms which have not been deprecated."
  },
  {
    name: "Sensitive Information Disclosure via Clipboard",
    severity: "Low",
    type: "Mobile",
    observation: "During the assessment, it was observed that any content that a user copy and pastes, could be leaked via third party application.",
    impact: "Any third-party software in iOS can access the content of the clipboard. Although the high version imposes access restrictions on the clipboard.",
    recommendation: `Remediation and lead practices defined by the industry, is to disable the clipboard functionality.
    Reference:
    https://programmer.group/disable-the-copy-and-paste-function-of-edittext.html`
  },
  {
    name: "Insecure Root Detection",
    severity: "Low",
    type: "Mobile",
    observation: "During the assessment, it was noted that the mobile application could be installed within the root device with a bypass.",
    impact: `Rooting or jailbreaking a device impacts the security of applications in two ways:
    It could allow malicious applications or attackers to perform actions as a root user which compromises the security of other applications running on the phone.
    Attackers can perform static and dynamic analysis of an application which helps find more vulnerabilities.`,
    recommendation: `It is recommended to detect all types of rooting mechanism, Including Magisk Hide.
    Reference:
    https://darvincitech.wordpress.com/2019/11/04/detecting-magisk-hide/`
  },
  {
    name: "Improper Input Handling",
    severity: "Low",
    type: "Mobile",
    observation: "During the assessment, it was observed that the application input accepted malicious payloads.",
    impact: "Improper input validation can enable attacks and lead to unwanted behavior. Parts of the system may receive unintended input, which may result in altered control flow, arbitrary control of a resource, or arbitrary code execution.",
    recommendation: `Input validation can be implemented using any programming technique that allows effective enforcement of syntactic and semantic correctness, for example:
        1) Data type validators available natively in web application frameworks (such as Django Validators, Apache Commons Validators etc).
        2) Validation against JSON Schema and XML Schema (XSD) for input in these formats.
        3) Type conversion (e.g. Integer.parseInt() in Java, int() in Python) with strict exception handling
        4) Minimum and maximum value range check for numerical parameters and dates, minimum and maximum length check for strings.
        5) Array of allowed values for small sets of string parameters (e.g. days of week).
        6) Regular expressions for any other structured data covering the whole input string (^...$) and not using "any character" wildcard (such as . or \S)`
  },
  {
    name: "JavaScript enabled in Webview",
    severity: "Low",
    type: "Mobile",
    observation: "During the assessment, it was observed that the mobile application has enabled JavaScript in WebView. By default, JavaScript is disabled in WebView.",
    impact: "If javascript has been enabled it can bring various JS-related security issues, such as cross-site scripting (xss) attacks.",
    recommendation: "KPMG recommends to disable javascript in webview"
  },
  {
    name: "Application can read/write to External Storage",
    severity: "Low",
    type: "Mobile",
    observation: "During the assessment, KPMG has identified that the mobile application stores data in external storage in read & write mode (e.g. SD card) and grant the permission of read/modify/delete SD card contents.",
    impact: "The mobile application's data stored on the external data storage may be accessed by other applications (including malicious ones) under certain conditions, and this would bring unwanted risks, corruption or unauthorized data tampering.",
    recommendation: `Remediation for this issue based on industry defined standards, would be the following:
    1) Ensure that the application does not store any sensitive data in the external storage of the device.
    2) The application should store data only in the internal storage of the device.
    3) Remove the permission "android.permission.WRITE_EXTERNAL_STORAGE".
    Reference:
    https://www.androidauthority.com/how-to-store-data-locally-in-android-app-717190/`
  },
  {
    name: "Minimum Device Security requirement absent",
    severity: "Low",
    type: "Mobile",
    observation: `During the assessment, KPMG has identified that the mobile application:
      1) Can be executed when the PIN or Pattern lock is not enabled.
      2) Users are able to take screenshot of the mobile application.
      3) Content is not masked/hided when users minimize application into background and visible in "Recent Apps/tasks" Section.`,
    impact: "These security measures are for in case a phone is lost, stolen, or simply left unattended. If the phone is unsecured, anyone that picks it up will have unrestricted access. This could involve data being stolen, or unwanted transaction being done, and could result in considerable financial cost.",
    recommendation: `Remediation for this issue based on industry defined standards, for this issue would be the following:-
        1) Setup to only allow to applications to be executed if the PIN, password, or pattern lock is enabled.
        2) Implement screenshot restrictions.
        3) Hide activity/content from Recent task section.
        Refer to "Settings.Secure" class in "android.provider" as below link: https://developer.android.com/reference/android/provider/Settings.Secure
            Refer to https://developer.android.com/guide/components/activities/recents`
  },
  {
    name: "No Jailbreak prevention/detection",
    severity: "Low",
    type: "Mobile",
    observation: "During the assessment, it was noted that the mobile application could install in jailbreak device with bypass.",
    impact: `It is recommended, that the application should implement jailbreak detection, when a jailbreak device is found application should reject to be installed on those devices.
      Reference:
      https://github.com/securing/IOSSecuritySuite`,
    recommendation: `Jailbreaking a device impacts the security of applications in two ways:
        It could allow malicious applications or attackers to perform actions as a root user, which compromises the security of other applications running on the phone.
        Attackers can perform static and dynamic analysis of an application which allows them to find more vulnerabilities if given access.`
  },
  {
    name: "Recommendation For Reviewing iOS Policy Settings",
    severity: "Low",
    type: "Mobile",
    observation: 'During the assessment, it was observed that "NSAllowsArbitaryLoads" was set to "YES".',
    impact: `If "NSAllowsArbitaryLoads" was set to YES, this disables all application transport security (ATS) restrictions for all network connections, apart from the connections to domains that configure individually in the optional ‘NSExceptionDomains’ dictionary.`,
    recommendation: `Management should consider the following recommendation(s):
    It is recommended that Boardroom should review the requirement for allowing arbitrary loads and, if not required, Boardroom should change the settings to ‘No’.`
  },
  {
    name: "File Path Disclosure via Error Page",
    severity: "Low",
    type: "Web App",
    observation: "During the assessment, KPMG identified that web application displayed file paths via custom error page.",
    impact: "Revealing information like file paths can assist attackers in gaining insights into the server's directory structure which can be used to identify other vulnerabilities.",
    recommendation: "Ensure file path is not disclosed in error responses."
  },
  {
    name: "Exposed CMS Admin Interface (Moji5)",
    severity: "Info",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the Moji5 web-based admin interface was found to be accessible.",
    impact: "An attacker with knowledge of the tool that gained internal network access could attempt unauthorized access, or exploit known vulnerabilities in the CMS, potentially leading to system compromise or defacement.",
    recommendation: "Restrict access to the Moji5 admin interface."
  },
  {
    name: "SSL Certificate Expiring",
    severity: "Info",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the host has an SSL certificate chain with one or more SSL certificates that are going to expiring.",
    impact: "Failure to renew these certificates before the expiration date may result in denial of service for users.",
    recommendation: "Purchase a valid SSL/TLS Certificate and replace the existing certificate."
  },
  {
    name: "IIS Reaching End of Life Service",
    severity: "Info",
    type: "Web App",
    observation: `During the assessment, KPMG identified that the server version is almost reaching end of life for IIS 8.5
    The end of life for IIS 8.5 as below:
    Windows Server 2012 R2 - IIS 8.5 (10 October 2023)`,
    impact: "Outdated Microsoft IIS versions are vulnerable to improper process. These versions have wildcard allow and deny rules for domains within the IP address and Domain restrictions list, it allows the attacker easily to perform remote attack to bypass an intended rule via an HTTP request.",
    recommendation: "It is recommended to upgrade to the latest Microsoft IIS version 10.0."
  },
  {
    name: "An Unsafe Content Security Policy (CSP) Directive in Use",
    severity: "Info",
    type: "Web App",
    observation: `During the assessment, KPMG identified that the web application uses the following Content Security Policy (CSP) directives:
    - unsafe-eval
    - unsafe-inline`,
    impact: "By using unsafe-eval, it is allowed the use of string evaluation functions like eval, also by using unsafe-inline, it is allowed the execution of inline scripts, which almost defeats the purpose of CSP. When this is allowed, it is very easy to successfully exploit a Cross-site Scripting (XSS) vulnerability on the web application and the attacker can bypass CSP and exploit a Cross-site Scripting (XSS) vulnerability successfully.",
    recommendation: `KPMG recommended to remove unsafe-eval and unsafe-inline from the CSP directives. If possible, use nonces to make inline content safe and use hashes to make inline content safe.
    
    References:
    https://content-security-policy.com/`
  },
  {
    name: "Hammer.js outdated version",
    severity: "Info",
    type: "Web App",
    observation: "During the assessment, KPMG identified that the web application use unsupported version of: - Hammer.js (2.0.7),",
    impact: "Affected versions of this package are slowing the hammer.js library which slow down the gesture.",
    recommendation: "Upgrade to latest or supported version of Hammer.js 2.0.8."
  },
  {
    name: "Improper Error Message Handling",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application has improper error messages handling. For this example, the error message leaks PHP queries in the web application.",
    impact: "Detailed error messages can reveal sensitive information (e.g., stack traces, database structure). This aids attackers in crafting targeted attacks.",
    recommendation: "Reconfigure the web application to display generic error messages to users when errors are present. However, it is also important to log detailed errors internally for debugging."
  },
  {
    name: "Sensitive Information Page Disclosure",
    severity: "Medium",
    type: "Web App",
    observation: "During the assessment, KPMG observed that the web application has improper handling for page redirection. For this example, an error message leaks PHP application code.",
    impact: "Detailed error messages can reveal sensitive information (e.g., stack traces, database structure). This aids attackers in crafting targeted attacks.",
    recommendation: "Reconfigure the web application to display generic error messages to users when errors are present. However, it is also important to log detailed errors internally for debugging."
  }
];

// define severity order
const severityOrder: Record<Finding["severity"], number> = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
  Info: 5,
};

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | Finding["type"]>("All");
  const [severityFilter, setSeverityFilter] = useState<"All" | Finding["severity"]>("All");
  const [visibleCount, setVisibleCount] = useState(20);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ✅ new state for toast alert
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ new state for selected findings
  const [selectedFindings, setSelectedFindings] = useState<Finding[]>([]);

  // ✅ handle selecting/deselecting a finding
  const toggleSelectFinding = (finding: Finding) => {
    setSelectedFindings((prev) =>
      prev.includes(finding)
        ? prev.filter((f) => f !== finding)
        : [...prev, finding]
    );
  };

  // ✅ export to Excel
  const handleExportExcel = () => {
    if (selectedFindings.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(selectedFindings);

    // ✅ Set column widths (optional, adjust per need)
    worksheet['!cols'] = [
      { wch: 20 }, // Name
      { wch: 10 }, // Severity
      { wch: 15 }, // Type
      { wch: 40 }, // Observation
      { wch: 40 }, // Impact
      { wch: 40 }, // Recommendation
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Findings");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "selected-findings.xlsx");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setVisibleCount((prev) => prev + 20);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredFindings = findings
    .filter((f) => {
      const matchesType = typeFilter === "All" || f.type === typeFilter;
      const matchesSeverity = severityFilter === "All" || f.severity === severityFilter;
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.observation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.impact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.recommendation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSeverity && matchesSearch;
    })
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const typeIcons: Record<Finding["type"], string> = {
    "Web App": "🌐",
    Mobile: "📱",
    Infra: "🏢",
    "Wi-Fi": "🌍",
    "Thick Client": "",
    "Red Team": "",
    "Source Code": "",
    Others: "",
  };

  // ✅ helper to show toast when copy is clicked
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000); // trigger fade out
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">📖 Book Of Findings</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono">
              {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          
          {/* Filters */}
          <div className="flex flex-wrap gap-6">
            {/* Filter by Type */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">Filter by Type:</span>
              {["All", "Web App", "Mobile", "Infra", "Wi-Fi", "Thick Client", "Red Team", "Source Code", "Others"].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    typeFilter === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Filter by Severity */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">Filter by Severity:</span>
              {["All", "Critical", "High", "Medium", "Low", "Informational"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    severityFilter === sev
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4 flex justify-end">
        {/* Search Bar */}
          <input
            type="text"
            placeholder="🔍 Search findings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-1 rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex-1"
          />
          <button
            onClick={handleExportExcel}
            disabled={selectedFindings.length === 0}
            className={`px-4 py-2 rounded-md font-medium mx-6 ${
              selectedFindings.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            ⬇️ Export Selected ({selectedFindings.length})
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-4 font-semibold">
          {filteredFindings.length} finding(s) matching filters
        </div>

        {/* Findings Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 dark:border-gray-700">
            <thead className="bg-gray-200 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left"></th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Severity</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left ">Observation</th>
                <th className="px-4 py-2 text-left ">Impact</th>
                <th className="px-4 py-2 text-left ">Recommendation</th>
                <th className="px-4 py-2">Copy</th>
              </tr>
            </thead>
            <tbody>
              {filteredFindings.slice(0, visibleCount).map((f, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {/* ✅ Checkbox */}
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedFindings.includes(f)}
                      onChange={() => toggleSelectFinding(f)}
                    />
                  </td>

                  <td className="px-4 py-2">{f.name}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        f.severity === "Critical"
                          ? "bg-red-700 text-white"
                          : f.severity === "High"
                          ? "bg-red-500 text-white"
                          : f.severity === "Medium"
                          ? "bg-yellow-500 text-black"
                          : "bg-green-500 text-black"
                      }`}
                    >
                      {f.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {typeIcons[f.type]} {f.type}
                  </td>
                  <td className="px-4 py-2 min-width whitespace-pre-line ">{f.observation}</td>
                  <td className="px-4 py-2 whitespace-pre-line">{f.impact}</td>
                  <td className="px-4 py-2 whitespace-pre-line">{f.recommendation}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() =>
                        handleCopy(
                          `${f.name}\t${f.severity}\t${f.observation}\t${f.impact}\t${f.recommendation}`
                        )
                      }
                      className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      📋 Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ✅ Toast Notification */}
        {showToast && (
          <div
            className={`fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-500 ${
              showToast ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            ✅ Copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
}