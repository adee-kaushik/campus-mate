import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/AuthPage';
export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [{ title: 'Student & Teacher Login — CampusMate' }, { name: 'description', content: 'Sign in to CampusMate as a student or approved teacher.' }, { property: 'og:title', content: 'CampusMate Login' }, { property: 'og:description', content: 'Student and teacher accounts for a connected campus.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: AuthPage,
});