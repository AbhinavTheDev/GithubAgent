import { Link } from "wouter";

export function Header() {
  return (
    <div className="w-full h-14 flex items-center justify-between px-4 border-b-1 border-b-primary">
      <div className="text-xl md:text-2xl font-bold font-serif">
        Dev Compass
      </div>
      <nav className="flex gap-6 items-center">
        <Link
          href="/dashboard"
          className="hover:underline text-base font-medium text-foreground"
        >
          Dashboard
        </Link>
        <Link
          href="/chat"
          className="hover:underline text-base font-medium text-foreground"
        >
          Chat
        </Link>
        <Link
          href="/file-tree"
          className="hover:underline text-base font-medium text-foreground"
        >
          File Tree
        </Link>
        <Link
          href="/audio"
          className="hover:underline text-base font-medium text-foreground"
        >
          Audio
        </Link>
      </nav>
    </div>
  );
}
