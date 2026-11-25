import { Search } from 'lucide-react'
import type { ChangeEvent, FormEvent } from 'react'

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative w-full">
      <label htmlFor="busca" className="sr-only">
        Buscar conteúdo
      </label>

      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-base-span"
      />

      <input
        id="busca"
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Buscar conteúdo"
        className="min-h-11 w-full rounded border border-base-border bg-base-input py-3 pl-12 pr-4 text-base text-base-title placeholder:text-base-span focus:border-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-base-background"
      />
    </form>
  )
}
