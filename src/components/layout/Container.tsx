import type { ReactNode } from 'react'

export interface ContainerProps {
  children: ReactNode
}

export function Container({ children }: ContainerProps) {
  return <div className="mx-auto w-full max-w-screen-lg px-4">{children}</div>
}
