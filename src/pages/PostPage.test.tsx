import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from '@/App.tsx'
import { clearGitHubCache } from '@/services/githubService.ts'
import { detailLog } from '@/test/handlers.ts'

afterEach(() => {
  clearGitHubCache()
})

/** Permite afirmar a mudança de rota sem depender do `window.location` do jsdom. */
function LocationProbe() {
  const location = useLocation()

  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>
}

function renderPost(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  )
}

describe('PostPage — Cenário 3 (detalhe, Markdown, VOLTAR e 404)', () => {
  it('renderiza GFM, metadados e ações, e VOLTAR preserva ?q=&page=', async () => {
    const user = userEvent.setup()
    renderPost('/post/42?q=runtime&page=2')

    expect(await screen.findByRole('heading', { name: 'Publicação 42', level: 1 })).toBeTruthy()
    expect(detailLog).toEqual([42])

    expect(screen.getByRole('heading', { name: 'Título do corpo', level: 2 })).toBeTruthy()
    expect(within(screen.getByRole('list')).getAllByRole('listitem').map((item) => item.textContent))
      .toEqual(['primeiro item', 'segundo item'])

    const docsLink = screen.getByRole('link', { name: 'Documentação' })
    expect(docsLink).toHaveAttribute('href', 'https://example.com/docs')
    expect(docsLink).toHaveAttribute('target', '_blank')
    expect(docsLink).toHaveAttribute('rel', 'noopener noreferrer')

    const code = screen.getByText('console.log("olá")')
    expect(code.closest('pre')).not.toBeNull()

    expect(screen.getByText('@autor')).toBeTruthy()
    expect(screen.getByText('há 2 dias')).toBeTruthy()
    expect(screen.getByText('3 comentários')).toBeTruthy()

    const githubLink = screen.getByRole('link', { name: 'VER NO GITHUB' })
    expect(githubLink).toHaveAttribute('href', 'https://example.com/issues/42')
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')

    await waitFor(() => expect(document.title).toBe('Publicação 42 — GitHub Blog'))

    await user.click(screen.getByRole('link', { name: 'VOLTAR' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/?q=runtime&page=2')
  })

  it('404 da API mostra mensagem amigável e o link leva à Home', async () => {
    const user = userEvent.setup()
    renderPost('/post/99999')

    expect(
      await screen.findByRole('heading', { name: 'Publicação não encontrada.' }),
    ).toBeTruthy()
    expect(detailLog).toEqual([99999])

    const homeLink = screen.getByRole('link', { name: 'Voltar à Home' })
    expect(homeLink).toHaveAttribute('href', '/')

    await user.click(homeLink)
    expect(screen.getByTestId('location')).toHaveTextContent('/')
  })

  it('número inválido na URL exibe 404 sem chamar a API', async () => {
    renderPost('/post/abc')

    expect(
      await screen.findByRole('heading', { name: 'Publicação não encontrada.' }),
    ).toBeTruthy()
    expect(detailLog).toHaveLength(0)
  })
})
