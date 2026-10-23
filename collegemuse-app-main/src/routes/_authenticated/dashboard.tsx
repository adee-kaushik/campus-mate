import { createFileRoute, Link } from '@tanstack/react-router';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { School, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
import { accountOptions, assignmentsOptions } from '@/lib/campus';
import { canPublish } from '@/lib/account';
import { supabase } from '@/integrations/supabase/client';
import { AssignmentBoard } from '@/components/AssignmentBoard';
import { Button } from '@/components/ui/button';
import { inputCls } from '@/components/AppShell';

export const Route = createFileRoute('/_authenticated/dashboard')({
  head: () => ({ meta: [{ title: 'Student & Teacher Dashboard — CampusMate' }, { name: 'description', content: 'Access shared campus assignments and manage your teacher account.' }, { property: 'og:title', content: 'CampusMate Dashboard' }, { property: 'og:description', content: 'Your campus assignments in one place.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  loader: async ({ context }) => { await Promise.all([context.queryClient.ensureQueryData(accountOptions), context.queryClient.ensureQueryData(assignmentsOptions)]); },
  errorComponent: ({ error }) => <p role="alert">{error.message}</p>,
  notFoundComponent: () => <p>Dashboard unavailable.</p>,
  component: Dashboard,
});
function Dashboard() {
  const { data: account } = useSuspenseQuery(accountOptions);
  const queryClient = useQueryClient();
  const [name, setName] = useState(account.name);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const teacher = canPublish(account.roles);
  async function requestTeacher() {
    setBusy(true);
    const { error } = await supabase.from('teacher_requests').insert({ user_id: account.id, display_name: account.name });
    setMessage(error ? error.message : 'Your teacher request has been sent for approval.');
    await queryClient.invalidateQueries({ queryKey: accountOptions.queryKey }); setBusy(false);
  }
  async function saveName() {
    if (!name.trim()) { setMessage('Enter your display name.'); return; }
    setBusy(true);
    const { error } = await supabase.from('profiles').update({ display_name: name.trim() }).eq('id', account.id);
    setMessage(error ? error.message : 'Name saved.');
    await queryClient.invalidateQueries({ queryKey: accountOptions.queryKey }); setBusy(false);
  }
  return <div className="space-y-8"><section className="border-b pb-7"><div className="flex items-center gap-2 text-sm font-semibold text-primary">{teacher ? <School className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}{teacher ? 'Teacher Dashboard' : 'Student Dashboard'}</div><h1 className="mt-3 break-words font-display text-3xl font-bold md:text-4xl">Welcome, {account.name}</h1><div className="mt-5 flex flex-wrap gap-3"><Button asChild><Link to="/assignments">{teacher ? 'Create assignment' : 'View assignments'}<ArrowRight /></Link></Button>{account.roles.includes('admin') && <Button asChild variant="outline"><Link to="/approvals"><ShieldCheck />Teacher approvals</Link></Button>}</div></section>
    {!teacher && account.request && <p className="rounded-lg bg-warning/15 p-4 text-sm text-warning-foreground">{account.request === 'pending' ? 'Your teacher access is awaiting approval. You can view assignments in the meantime.' : account.request === 'rejected' ? 'Your teacher request was not approved. Contact your campus administrator.' : 'Your teacher request has been reviewed. Refresh to update access.'}</p>}
    <AssignmentBoard compact />
    <section className="border-t pt-6"><h2 className="mb-3 font-display text-xl font-bold">Your account</h2><div className="flex max-w-md flex-wrap gap-2"><input aria-label="Display name" maxLength={100} className={`${inputCls} min-w-0 flex-1`} value={name} onChange={e => setName(e.target.value)} /><Button variant="outline" disabled={busy} onClick={saveName}>Save name</Button></div>{!teacher && !account.request && <Button className="mt-4" variant="link" disabled={busy} onClick={requestTeacher}>Request teacher access</Button>}{message && <p role="status" className="mt-3 text-sm">{message}</p>}</section>
  </div>;
}