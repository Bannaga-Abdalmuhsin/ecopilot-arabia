import { Link, useLocation } from "wouter"
import { Building2, History, Leaf } from "lucide-react"

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline-block text-lg font-bold tracking-tight text-foreground">
            Taqah <span className="text-muted-foreground font-medium">Advisor</span>
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-6">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${location === "/" ? "text-primary" : "text-muted-foreground"}`}
          >
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              <span>New Assessment</span>
            </div>
          </Link>
          <Link 
            href="/history" 
            className={`text-sm font-medium transition-colors hover:text-primary ${location === "/history" ? "text-primary" : "text-muted-foreground"}`}
          >
            <div className="flex items-center gap-1.5">
              <History className="h-4 w-4" />
              <span>History</span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  )
}
