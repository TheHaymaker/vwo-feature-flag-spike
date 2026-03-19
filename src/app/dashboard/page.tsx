import { getServerFlag } from "@/lib/vwo/server";
import { FlagBadge } from "@/components/flag-badge";

// Force dynamic rendering so flags are evaluated on each request
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const widgetFlag = await getServerFlag("new_dashboard_widget");

  const widgetTitle =
    (widgetFlag.variables.widget_title as string) ?? "Analytics Overview";
  const showChart = (widgetFlag.variables.show_chart as boolean) ?? true;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          This page uses{" "}
          <strong>server-side flag evaluation</strong> — the flag is checked in a
          Server Component at request time, with zero client JavaScript for the
          flag logic.
        </p>
      </div>

      {/* Stats row — always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: "12,847", change: "+12%" },
          { label: "Active Today", value: "1,429", change: "+3%" },
          { label: "Flags Active", value: "4", change: "0%" },
          { label: "Events Today", value: "8,312", change: "+18%" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-xl border border-border"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
            <p className="text-sm text-success mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Server-rendered widget controlled by feature flag */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              {widgetFlag.isEnabled ? widgetTitle : "New Analytics Widget"}
            </h2>
            <FlagBadge
              flagKey="new_dashboard_widget"
              enabled={widgetFlag.isEnabled}
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
            Server Component
          </span>
        </div>
        <div className="p-6">
          {widgetFlag.isEnabled ? (
            <div>
              {showChart && (
                <div className="mb-6">
                  {/* Simple ASCII-style chart visualization */}
                  <p className="text-sm text-muted-foreground mb-3">
                    Conversion Rate — Last 7 Days
                  </p>
                  <div className="flex items-end gap-2 h-40">
                    {[35, 42, 38, 55, 48, 62, 71].map((value, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <div
                          className="w-full bg-accent/80 rounded-t-sm transition-all"
                          style={{ height: `${value}%` }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Avg. Conversion", value: "4.2%" },
                  { label: "Bounce Rate", value: "32%" },
                  { label: "Avg. Session", value: "3m 42s" },
                ].map((metric) => (
                  <div key={metric.label} className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-muted-foreground mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
                />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                The new analytics widget is behind the{" "}
                <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                  new_dashboard_widget
                </code>{" "}
                feature flag. Enable it in the{" "}
                <a href="/admin" className="text-accent hover:underline">
                  Admin Dashboard
                </a>{" "}
                to preview it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
