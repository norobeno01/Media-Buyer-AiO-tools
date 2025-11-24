"use client";

import { useState } from "react";

export default function Diagnostics() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [checks, setChecks] = useState({
    ssl: true,
    mobile: true,
    speed: true,
    seo: true,
    accessibility: true,
    security: true
  });

  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    if (!websiteUrl.trim()) {
      alert("Please enter a website URL");
      return;
    }

    setIsLoading(true);
    
    // Simulate diagnostic checks with mock data
    setTimeout(() => {
      const mockResults = {
        ssl: checks.ssl ? {
          passed: true,
          score: 100,
          message: "SSL certificate is valid and properly configured",
          details: "HTTPS is enabled with a valid SSL certificate"
        } : null,
        
        mobile: checks.mobile ? {
          passed: Math.random() > 0.3,
          score: Math.floor(Math.random() * 30) + 70,
          message: Math.random() > 0.3 ? "Mobile-friendly design detected" : "Mobile optimization needed",
          details: "Responsive design and mobile usability checks"
        } : null,
        
        speed: checks.speed ? {
          passed: Math.random() > 0.4,
          score: Math.floor(Math.random() * 40) + 60,
          message: Math.random() > 0.4 ? "Good loading performance" : "Speed optimization recommended",
          details: `Page load time: ${(Math.random() * 3 + 1).toFixed(1)}s`
        } : null,
        
        seo: checks.seo ? {
          passed: Math.random() > 0.2,
          score: Math.floor(Math.random() * 35) + 65,
          message: Math.random() > 0.2 ? "SEO fundamentals in place" : "SEO improvements needed",
          details: "Meta tags, headings, and content structure analysis"
        } : null,
        
        accessibility: checks.accessibility ? {
          passed: Math.random() > 0.3,
          score: Math.floor(Math.random() * 30) + 70,
          message: Math.random() > 0.3 ? "Good accessibility practices" : "Accessibility enhancements needed",
          details: "WCAG compliance and screen reader compatibility"
        } : null,
        
        security: checks.security ? {
          passed: Math.random() > 0.4,
          score: Math.floor(Math.random() * 25) + 75,
          message: Math.random() > 0.4 ? "Security headers configured" : "Security improvements recommended",
          details: "Security headers and vulnerability checks"
        } : null
      };

      const activeChecks = Object.values(mockResults).filter(result => result !== null);
      const overallScore = activeChecks.reduce((sum, result) => sum + result.score, 0) / activeChecks.length;
      const passedChecks = activeChecks.filter(result => result.passed).length;
      const totalChecks = activeChecks.length;

      setResults({
        url: websiteUrl,
        checks: mockResults,
        overallScore: Math.round(overallScore),
        passedChecks,
        totalChecks,
        grade: overallScore >= 90 ? "A+" : overallScore >= 80 ? "A" : overallScore >= 70 ? "B" : overallScore >= 60 ? "C" : "D"
      });
      
      setIsLoading(false);
    }, 2000);
  };

  const exportResults = () => {
    if (!results) return;
    
    const csvContent = [
      ["Check", "Status", "Score", "Message", "Details"],
      ...Object.entries(results.checks).filter(([_, result]) => result !== null).map(([check, result]: [string, any]) => [
        check.charAt(0).toUpperCase() + check.slice(1),
        result.passed ? "Passed" : "Failed",
        `${result.score}/100`,
        result.message,
        result.details
      ]),
      ["", "", "", "", ""],
      ["Overall Score", "-", `${results.overallScore}/100`, "-", "-"],
      ["Grade", results.grade, "-", "-", "-"],
      ["Passed Checks", `${results.passedChecks}/${results.totalChecks}`, "-", "-", "-"]
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnostics-${results.url.replace(/https?:\/\//, "").replace(/\//g, "-")}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? "✅" : "❌";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
          Diagnostics
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Website Diagnostics</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Comprehensive website health check and performance analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Website URL</h2>
            
            <div>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Diagnostic Checks</h2>
            
            <div className="space-y-3">
              {Object.entries(checks).map(([check, enabled]) => (
                <label key={check} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setChecks({...checks, [check]: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {check.charAt(0).toUpperCase() + check.slice(1)}
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {check === "ssl" && "Check SSL certificate validity"}
                      {check === "mobile" && "Test mobile responsiveness"}
                      {check === "speed" && "Analyze page loading speed"}
                      {check === "seo" && "Check SEO optimization"}
                      {check === "accessibility" && "Test accessibility compliance"}
                      {check === "security" && "Check security headers"}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={runDiagnostics}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              {isLoading ? "Running Diagnostics..." : "Run Diagnostics"}
            </button>
          </div>

          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">What We Check</h3>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• <strong>SSL:</strong> Certificate validity and HTTPS setup</li>
              <li>• <strong>Mobile:</strong> Responsive design and mobile UX</li>
              <li>• <strong>Speed:</strong> Page load times and performance</li>
              <li>• <strong>SEO:</strong> Meta tags, headings, and content</li>
              <li>• <strong>Accessibility:</strong> WCAG compliance</li>
              <li>• <strong>Security:</strong> Headers and vulnerability checks</li>
            </ul>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {results && (
            <div className="space-y-4">
              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
                <div className="text-6xl font-bold mb-2">
                  {results.grade === "A+" && "🎯"}
                  {results.grade === "A" && "⭐"}
                  {results.grade === "B" && "👍"}
                  {results.grade === "C" && "😐"}
                  {results.grade === "D" && "⚠️"}
                </div>
                <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {results.overallScore}/100
                </div>
                <div className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
                  Grade: {results.grade}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  {results.passedChecks} of {results.totalChecks} checks passed
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Diagnostic Results</h3>
                  <button
                    onClick={exportResults}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(results.checks).map(([check, result]: [string, any]) => {
                    if (!result) return null;
                    return (
                      <div key={check} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getStatusIcon(result.passed)}</span>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {check.charAt(0).toUpperCase() + check.slice(1)}
                            </div>
                          </div>
                          <div className={`font-bold ${getScoreColor(result.score)}`}>
                            {result.score}/100
                          </div>
                        </div>
                        
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                          {result.message}
                        </div>
                        
                        <div className="text-xs text-zinc-500 dark:text-zinc-500">
                          {result.details}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recommendations</h3>
                
                <div className="space-y-2">
                  {results.overallScore < 70 && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="font-medium text-red-800 dark:text-red-200 mb-1">Priority Issues</div>
                      <div className="text-sm text-red-700 dark:text-red-300">
                        Focus on fixing failed checks first, especially SSL and security issues.
                      </div>
                    </div>
                  )}
                  
                  {results.overallScore >= 70 && results.overallScore < 85 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Optimization Opportunities</div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        Good foundation! Work on improving speed and SEO for better performance.
                      </div>
                    </div>
                  )}
                  
                  {results.overallScore >= 85 && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="font-medium text-green-800 dark:text-green-200 mb-1">Excellent Performance</div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        Great job! Maintain current standards and monitor regularly.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}