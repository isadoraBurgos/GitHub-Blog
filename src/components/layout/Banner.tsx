import { Terminal } from 'lucide-react'

export function Banner() {
  return (
    <div className="w-full bg-base-background py-10">
      <div className="mx-auto flex max-w-screen-lg items-center justify-center gap-3 px-4">
        <Terminal aria-hidden="true" className="size-7 shrink-0 text-blue" strokeWidth={2.5} />
        <span className="text-center text-2xl font-bold tracking-wide text-base-title">
          GITHUB BLOG
        </span>
      </div>
    </div>
  )
}
