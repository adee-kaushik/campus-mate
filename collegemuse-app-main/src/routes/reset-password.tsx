import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { inputCls } from '@/components/AppShell';
export const Route = createFileRoute('/reset-password')({
  head: () => ({ meta: [{ title: 'Reset Password — CampusMate' }, { name: 'description', content: 'Set a new password for your CampusMate account.' }, { property: 'og:title', content: 'CampusMate Password Reset' }, { property: 'og:description', content: 'Recover access to your campus account.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: ResetPassword,
});
function ResetPassword() {
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setValid(new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'); }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setMessage('Passwords do not match.'); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false); setMessage(error ? error.message : 'Password updated.'); setDone(!error);
  }
  return <div className="mx-auto max-w-md py-10"><h1 className="mb-6 font-display text-3xl font-bold">Reset password</h1>{valid && !done ? <form onSubmit={save} className="space-y-4"><label className="block text-sm">New password<input required minLength={8} type="password" autoComplete="new-password" className={`${inputCls} mt-1`} value={password} onChange={e => setPassword(e.target.value)} /></label><label className="block text-sm">Confirm password<input required minLength={8} type="password" autoComplete="new-password" className={`${inputCls} mt-1`} value={confirm} onChange={e => setConfirm(e.target.value)} /></label><Button disabled={busy} type="submit">Update password</Button></form> : !done && <p className="mb-4 text-muted-foreground">Open the password reset link from your email to continue.</p>}{message && <p role="status" className="my-4">{message}</p>}<Button asChild variant="link"><Link to="/auth">Back to sign in</Link></Button></div>;
}