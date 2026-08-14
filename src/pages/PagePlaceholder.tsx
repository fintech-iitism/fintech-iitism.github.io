interface PagePlaceholderProps {
  title: string
}

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center md:py-32">
      <h1 className="font-pixel text-2xl leading-tight text-white">{title}</h1>
      <p className="mt-4 font-mono text-sm text-white/70">Coming soon.</p>
    </section>
  )
}
