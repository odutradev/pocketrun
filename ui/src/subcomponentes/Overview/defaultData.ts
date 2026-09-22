import type { FeatureItem } from './types'

export const defaultFeatures: FeatureItem[] = [
  {
    id: 'api',
    title: 'Go REST API',
    description: 'Lightweight backend server running with high performance in Go 1.24.',
    badge: 'Backend'
  },
  {
    id: 'ui',
    title: 'Vite React UI',
    description: 'Fast frontend application structured with TypeScript and Clean Code modular setup.',
    badge: 'Frontend'
  },
  {
    id: 'dokploy',
    title: 'Dokploy Docker Deploy',
    description: 'Multi-stage Docker builds and docker-compose orchestration ready for production.',
    badge: 'DevOps'
  }
]
