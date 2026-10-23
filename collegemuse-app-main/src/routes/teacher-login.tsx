import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/AuthPage';
export const Route = createFileRoute('/teacher-login')({
  head: () => ({ meta: [{ title: 'Teacher Login — CampusMate' }, { name: 'description', content: 'Sign in to CampusMate as a teacher.' }, { property: 'og:title', content: 'CampusMate Teacher Login' }, { property: 'og:type', content: 'website' }] }),
  component: () => <AuthPage role="teacher" />,
});
