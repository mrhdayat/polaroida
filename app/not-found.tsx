import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <h2 className="text-4xl font-black mb-4 tracking-tighter">404</h2>
      <p className="text-muted mb-8">Could not find requested resource</p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-foreground text-background font-medium hover:opacity-80 transition-opacity"
      >
        Return Home
      </Link>
    </div>
  )
}
