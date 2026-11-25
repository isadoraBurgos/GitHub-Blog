import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '@/App.tsx'

/** A sonda confirma a navegação sem reload nem leitura do `window.location`. */
function LocationProbe() {
  const location = useLocation()

  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>
}

describe('NotFoundPage — Cenário 3 (rota inexistente)', () => {
  it('mostra mensagem amigável e o link leva à Home', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/rota-inexistente']}>
        <App />
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Página não encontrada.' })).toBeTruthy()
    expect(document.title).toBe('Página não encontrada — GitHub Blog')

    const homeLink = screen.getByRole('link', { name: 'Voltar à Home' })
    expect(homeLink).toHaveAttribute('href', '/')

    await user.click(homeLink)
    expect(screen.getByTestId('location')).toHaveTextContent('/')
    expect(await screen.findByRole('heading', { name: 'Isadora Burgos' })).toBeTruthy()
  })
})
