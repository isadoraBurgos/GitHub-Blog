import { ExternalLink } from 'lucide-react'
import type { GitHubUser } from '@/types'

export interface ProfileCardProps {
  profile: GitHubUser
}

const followersFormatter = new Intl.NumberFormat('pt-BR')

export function ProfileCard({ profile }: ProfileCardProps) {
  const displayName = profile.name ?? profile.login
  const followersLabel = profile.followers === 1 ? 'seguidor' : 'seguidores'

  return (
    <section
      aria-labelledby="profile-name"
      className="relative -mt-10 rounded-lg border border-base-border bg-base-profile p-6"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <img
          src={profile.avatar_url}
          alt={`Foto de perfil de ${profile.login}`}
          width={128}
          height={128}
          className="size-24 shrink-0 rounded-lg object-cover sm:size-32"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1">
            <h2 id="profile-name" className="text-2xl font-bold text-base-title">
              {displayName}
            </h2>
            <p className="text-sm text-blue">@{profile.login}</p>
          </div>

          {profile.bio ? <p className="mt-4 text-base text-base-text">{profile.bio}</p> : null}
          {profile.company ? (
            <p className="mt-2 text-sm text-base-subtitle">{profile.company}</p>
          ) : null}

          <p className="mt-4 text-sm text-base-text">
            <span className="font-bold text-base-title">
              {followersFormatter.format(profile.followers)}
            </span>{' '}
            {followersLabel}
          </p>

          <a
            href={profile.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded border border-base-border px-4 py-2 text-sm font-bold text-blue hover:border-blue focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 focus-visible:ring-offset-base-background"
          >
            GITHUB
            <ExternalLink aria-hidden="true" className="size-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
