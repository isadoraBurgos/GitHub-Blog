import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PaginationProps {
  page: number
  hasNextPage: boolean
  onPageChange: (page: number) => void
}

const BUTTON_CLASS =
  'inline-flex min-h-11 items-center gap-2 rounded border border-base-border px-4 py-2 text-sm font-bold text-base-title enabled:hover:border-base-label disabled:cursor-not-allowed disabled:text-base-label focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-base-background'

export function Pagination({ page, hasNextPage, onPageChange }: PaginationProps) {
  return (
    <nav
      aria-label="Paginação de publicações"
      className="mt-8 flex items-center justify-between gap-4"
    >
      <button
        type="button"
        onClick={(): void => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className={BUTTON_CLASS}
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Anterior
      </button>

      <span aria-live="polite" className="text-sm text-base-span">
        Página {page}
      </span>

      <button
        type="button"
        onClick={(): void => onPageChange(page + 1)}
        disabled={!hasNextPage}
        aria-label="Próxima página"
        className={BUTTON_CLASS}
      >
        Próxima
        <ChevronRight aria-hidden="true" className="size-4" />
      </button>
    </nav>
  )
}
