"use client";
import { useState, useEffect } from "react";

type Finding = {
  name: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  observation: string;
  impact: string;
  recommendation: string;
  type: "Web App" | "Mobile" | "Internal" | "External";
};

const findings: Finding[] = [
  {
    name: "SQL Injection",
    severity: "High",
    observation: "Unsanitized input in login form.",
    impact: "Can dump entire database.",
    recommendation: "Use prepared statements with parameterized queries.",
    type: "Web App",
  },
  {
    name: "Weak Password Policy",
    severity: "Medium",
    observation: "Users allowed to set short passwords.",
    impact: "Increases likelihood of brute force attacks.",
    recommendation: "Enforce strong password requirements.",
    type: "Internal",
  },
  {
    name: "Insecure Data Storage",
    severity: "Critical",
    observation: "Sensitive data stored in plaintext on device.",
    impact: "Data theft if device is compromised.",
    recommendation: "Encrypt sensitive data at rest.",
    type: "Mobile",
  },
  {
    name: "Open SSH Port",
    severity: "Low",
    observation: "SSH port exposed to the internet.",
    impact: "Could be brute-forced if weak credentials exist.",
    recommendation: "Restrict access with firewall and keys.",
    type: "External",
  },
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
    observation: "During the assessment, KPMG discovered that the \"Cross-Origin-Resource-Policy\" Security Header is absent from the web application.",
    impact: "Without the \"Cross-Origin-Resource-Policy\" Security Header, the web application is unable to block access to a specific resource that is sent by the server.",
    recommendation: "Reconfigure the web application with the \"Cross-Origin-Resource-Policy\" Security Header enabled. Additionally, ensure that the value set for the policy is \"same-origin\", or \"same-site\". This means that the resources are only allowed to be fetched from the same origin or the same site.",
    type: "Web App"
  },
  {
    name: "Stored HTML Injection",
    severity: "High",
    observation: "During the assessment, KPMG observed that the web application is vulnerable to HTML Injection.",
    impact: "Stored HTML Injection enables attackers to inject arbitrary HTML content into the application, which is then stored and rendered to other users. This can lead to UI redressing, phishing, or even XSS if scripts are embedded.",
    recommendation: "Validate and sanitize all user-submitted HTML content. If HTML input is necessary (e.g., for rich text), use a secure HTML sanitizer (like DOMPurify) to strip dangerous tags and attributes. Avoid rendering raw HTML unless absolutely required.",
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
    Internal: "🏢",
    External: "🌍",
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
          {/* Search Bar */}
          <input
            type="text"
            placeholder="🔍 Search findings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex-1"
          />

          {/* Filters */}
          <div className="flex flex-wrap gap-6">
            {/* Filter by Type */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">Filter by Type:</span>
              {["All", "Web App", "Mobile", "Internal", "External"].map((type) => (
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
              {["All", "Critical", "High", "Medium", "Low", "Info"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    severityFilter === sev
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
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
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Severity</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Observation</th>
                <th className="px-4 py-2 text-left">Impact</th>
                <th className="px-4 py-2 text-left">Recommendation</th>
                <th className="px-4 py-2">Copy</th>
              </tr>
            </thead>
            <tbody>
              {filteredFindings.slice(0, visibleCount).map((f, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
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
                  <td className="px-4 py-2">{f.observation}</td>
                  <td className="px-4 py-2">{f.impact}</td>
                  <td className="px-4 py-2">{f.recommendation}</td>
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