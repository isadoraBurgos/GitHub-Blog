import { Route, Routes } from 'react-router-dom'
import { Container, Header } from '@/components/layout'
import HomePage from '@/pages/HomePage.tsx'
import NotFoundPage from '@/pages/NotFoundPage.tsx'
import PostPage from '@/pages/PostPage.tsx'

export default function App() {
  return (
    <div className="min-h-screen bg-base-background text-base-text">
      <Header />

      <main id="conteudo" tabIndex={-1} className="focus:outline-none">
        <Container>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:number" element={<PostPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Container>
      </main>
    </div>
  )
}
