import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from '@/App.tsx'
import { PER_PAGE, USERNAME } from '@/config/github.ts'
import { clearGitHubCache } from '@/services/githubService.ts'
import { requestLog } from '@/test/handlers.ts'

afterEach(() => {
  clearGitHubCache()
})

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
}

function issueList() {
  return screen.getByRole('list')
}

function issueTitles(): string[] {
  return within(issueList())
    .getAllByRole('listitem')
    .map((item) => within(item).getByRole('heading', { level: 3 }).textContent ?? '')
}

describe('HomePage — Cenário 1 (listagem e paginação)', () => {
  it('carrega perfil, 6 publicações sem PRs e avança para a página 2', async () => {
    const user = userEvent.setup()
    renderHome()

    expect(screen.getByText('GITHUB BLOG')).toBeTruthy()
    expect(await screen.findByRole('heading', { name: 'Isadora Burgos' })).toBeTruthy()
    expect(screen.getByText(`@${USERNAME}`)).toBeTruthy()
    expect(screen.getByText('Desenvolvedora de software')).toBeTruthy()
    expect(screen.getByAltText(`Foto de perfil de ${USERNAME}`)).toBeTruthy()

    expect(screen.getByRole('heading', { name: 'Publicações', level: 2 })).toBeTruthy()
    expect(await screen.findByText('Publicação 6')).toBeTruthy()

    expect(screen.getByText('12 publicações')).toBeTruthy()
    await waitFor(() => expect(requestLog).toHaveLength(1))
    expect(requestLog[0]).toEqual({ page: '1', perPage: String(PER_PAGE) })

    expect(issueTitles()).toEqual([
      'Publicação 1',
      'Publicação 2',
      'Publicação 3',
      'Publicação 4',
      'Publicação 5',
      'Publicação 6',
    ])
    expect(screen.queryByText('Pull Request: não deve aparecer')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Próxima página' }))

    expect(await screen.findByText('Publicação 7')).toBeTruthy()
    await waitFor(() => expect(requestLog).toHaveLength(2))
    expect(requestLog[1]).toEqual({ page: '2', perPage: String(PER_PAGE) })

    expect(issueTitles()).toEqual([
      'Publicação 7',
      'Publicação 8',
      'Publicação 9',
      'Publicação 10',
      'Publicação 11',
      'Publicação 12',
    ])
    expect(screen.queryByText('Pull Request: não deve aparecer')).toBeNull()
    expect(screen.getByText('Página 2')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Página anterior' }).hasAttribute('disabled')).toBe(
      false,
    )
  })
})
