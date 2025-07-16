import { Link } from "wouter";

export function Header() {
  return (
    <div className="w-full h-14 flex items-center justify-between px-4 border-b-1 border-b-primary">
      <div className="text-xl md:text-2xl font-bold font-serif">
        Dev Compass
      </div>
      <nav id="navbarCollapse" className="">
        <ul className="flex justify-between items-center gap-10 text-base">
          <Link href="/dashboard" className=" hover:text-foreground/60">
            Home
          </Link>
          <Link href="/chat" className="hover:text-foreground/60">
            Chat
          </Link>
          <Link href="/file-tree" className=" hover:text-foreground/60">
            File Tree
          </Link>
          <Link href="/audio" className=" hover:text-foreground/60">
            Audio
          </Link>
        </ul>
      </nav>
    </div>
  );
}
