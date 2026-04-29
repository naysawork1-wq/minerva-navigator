import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Minerva — Athena Education Ideation Platform" },
      { name: "description", content: "AI-powered project ideation, mentor allocation, and scholar tracking for the Minerva and Pangea programs." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-cream-soft px-4 text-center">
      <div>
        <div className="font-serif text-7xl text-navy">404</div>
        <p className="text-ink-muted mt-2">This page hasn't been authored yet.</p>
        <a href="/" className="btn-primary mt-6 inline-flex">Go home</a>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
function RootComponent() { return <Outlet />; }
