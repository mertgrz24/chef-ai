import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center"
      style={{ backgroundColor: '#f5f5f0' }}
    >
      <Link
        href="/"
        className="mb-8 text-2xl font-bold tracking-tight"
        style={{ color: '#ffa51f' }}
      >
        ChefAI
      </Link>
      {children}
    </div>
  )
}
