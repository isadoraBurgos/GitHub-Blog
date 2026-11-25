import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Página não encontrada — GitHub Blog'

    return (): void => {
      document.title = 'GitHub Blog'
    }
  }, [])

  return (
    <section className="mt-10 rounded-lg border border-base-border bg-base-profile p-6">
      <h1 className="text-2xl font-bold text-base-title">Página não encontrada.</h1>
      <p className="mt-3 text-sm text-base-text">O endereço acessado não existe ou foi movido.</p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-11 items-center rounded border border-base-border px-4 py-2 text-sm font-bold text-blue hover:border-blue focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-base-background"
      >
        Voltar à Home
      </Link>
    </section>
  )
}
