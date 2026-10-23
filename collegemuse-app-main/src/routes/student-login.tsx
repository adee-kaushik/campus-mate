import { createFileRoute } from '@tanstack/react-router';
import { AuthPage } from '@/components/AuthPage';
export const Route = createFileRoute('/student-login')({
  head: () => ({ meta: [{ title: 'Student Login — CampusMate' }, { name: 'description', content: 'Sign in to CampusMate as a student.' }, { property: 'og:title', content: 'CampusMate Student Login' }, { property: 'og:type', content: 'website' }] }),
  component: () => <AuthPage role="student" />,
});
