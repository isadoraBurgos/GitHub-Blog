import { Banner } from './Banner.tsx'

export function Header() {
  return (
    <header>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-base-post focus:px-4 focus:py-3 focus:text-base-title focus:ring-2 focus:ring-blue focus-visible:ring-2 focus-visible:ring-blue"
      >
        Pular para o conteúdo
      </a>
      <Banner />
    </header>
  )
}
