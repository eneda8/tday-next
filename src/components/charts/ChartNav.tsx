import Link from "next/link";

interface ChartNavProps {
  current: "today" | "all" | "me";
}

const LINKS = [
  { key: "today", href: "/charts", label: "Today's Charts" },
  { key: "all", href: "/charts/all", label: "All Charts" },
  { key: "me", href: "/charts/me", label: "My Charts" },
] as const;

export default function ChartNav({ current }: ChartNavProps) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {LINKS.map((link) =>
        link.key === current ? (
          <span
            key={link.key}
            className="font-medium text-forest"
          >
            {link.label}
          </span>
        ) : (
          <Link
            key={link.key}
            href={link.href}
            className="text-warm-gray hover:text-forest transition-colors"
          >
            {link.label}
          </Link>
        )
      )}
    </div>
  );
}
