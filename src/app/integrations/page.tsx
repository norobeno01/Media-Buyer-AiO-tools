export default function IntegrationsPage() {
  const links = [
    { label: "Meta Ad Library", href: "https://www.facebook.com/ads/library" },
    { label: "TikTok Creative Center", href: "https://www.tiktok.com/business/creativecenter" },
    { label: "Google Ads Keyword Planner", href: "https://ads.google.com/home/tools/keyword-planner/" },
    { label: "Canva Templates", href: "https://www.canva.com/templates/" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Integrations</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Quick links to external tools and libraries useful for media buyers.
      </p>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {links.map((l) => (
          <li key={l.href}>
            <a
              className="block rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}