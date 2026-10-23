import { createFileRoute } from '@tanstack/react-router';
import { accountOptions, assignmentsOptions } from '@/lib/campus';
import { AssignmentBoard } from '@/components/AssignmentBoard';
import { PageHeader } from '@/components/AppShell';
export const Route = createFileRoute('/_authenticated/assignments')({
  head: () => ({ meta: [{ title: 'Shared Assignments — CampusMate' }, { name: 'description', content: 'View assignments, deadlines and attached photos from campus teachers.' }, { property: 'og:title', content: 'CampusMate Assignments' }, { property: 'og:description', content: 'Assignments shared by approved teachers with all students.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  loader: async ({ context }) => { await Promise.all([context.queryClient.ensureQueryData(accountOptions), context.queryClient.ensureQueryData(assignmentsOptions)]); },
  errorComponent: ({ error }) => <p role="alert">{error.message}</p>,
  notFoundComponent: () => <p>Assignments unavailable.</p>,
  component: () => <><PageHeader title="Assignments" /><AssignmentBoard /></>,
});