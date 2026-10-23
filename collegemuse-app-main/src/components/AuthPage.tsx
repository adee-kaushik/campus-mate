import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { GraduationCap, School, ArrowRight, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import '@lovable.dev/cloud-auth-js/styles.css';
import { Button } from '@/components/ui/button';
import { inputCls } from './AppShell';
import { useAccount } from './AccountProvider';

export function AuthPage({ role }: { role: 'student' | 'teacher' }) {
  const { user, ready } = useAccount();
  const navigate = useNavigate();
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      if (signup) {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name.trim(), requested_role: role }, emailRedirectTo: window.location.origin } });
        if (error) throw error;
        if (!data.session) { setMessage('Check your email to confirm your account, then sign in.'); return; }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      await navigate({ to: '/dashboard' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Sign-in failed. Try again.'); }
    finally { setBusy(false); }
  }
  async function social(provider: 'google' | 'lovable') {
    setBusy(true); setError('');
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (!result.redirected) await navigate({ to: '/dashboard' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in.'); }
    finally { setBusy(false); }
  }
  async function forgot() {
    if (!email.trim()) { setError('Enter your email address first.'); return; }
    setBusy(true); setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    if (error) setError(error.message); else setMessage('Check your email for a password reset link.');
  }
  return <div className="mx-auto max-w-md py-8 md:py-12">
    <div className="mb-8 text-center"><GraduationCap className="mx-auto mb-3 h-10 w-10 text-primary" /><h1 className="font-display text-4xl font-bold">CampusMate</h1><p className="mt-2 text-muted-foreground">Your campus, connected.</p></div>
    {!ready ? <p className="text-center text-muted-foreground">Loading account…</p> : user ? <div className="space-y-4 text-center"><h2 className="font-display text-2xl font-bold">Welcome back</h2><Button asChild className="w-full"><Link to="/dashboard">Open your dashboard <ArrowRight /></Link></Button></div> : <>
      <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-secondary p-3 font-semibold">{role === 'student' ? <GraduationCap className="h-5 w-5 text-primary" /> : <School className="h-5 w-5 text-primary" />}{role === 'student' ? 'Student Login' : 'Teacher Login'}</div>
      <h2 className="mb-5 font-display text-2xl font-bold">{signup ? `Create ${role} account` : `${role === 'student' ? 'Student' : 'Teacher'} sign in`}</h2>
      <form onSubmit={submit} className="space-y-4">
        {signup && <label className="block text-sm font-medium">Display name<input required maxLength={100} autoComplete="name" className={`${inputCls} mt-1`} value={name} onChange={e => setName(e.target.value)} /></label>}
        <label className="block text-sm font-medium">Email<input required type="email" autoComplete="email" className={`${inputCls} mt-1`} value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="block text-sm font-medium">Password<input required type="password" minLength={8} autoComplete={signup ? 'new-password' : 'current-password'} className={`${inputCls} mt-1`} value={password} onChange={e => setPassword(e.target.value)} /></label>
        {signup && role === 'teacher' && <p className="rounded-lg bg-warning/15 p-3 text-sm text-warning-foreground">Teacher access requires approval. You can view assignments while your request is pending.</p>}
        <Button disabled={busy} className="w-full" type="submit">{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}<ArrowRight /></Button>
      </form>
      <div className="mt-3 flex justify-between gap-2"><Button variant="link" disabled={busy} onClick={() => { setSignup(!signup); setMessage(''); setError(''); }}>{signup ? 'Already have an account?' : 'Create an account'}</Button>{!signup && <Button variant="link" disabled={busy} onClick={forgot}>Forgot password?</Button>}</div>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />OR<div className="h-px flex-1 bg-border" /></div>
      <div className="space-y-2"><Button variant="outline" className="w-full" disabled={busy} onClick={() => social('google')}>Continue with Google</Button><Button className="lovable-auth-button w-full" disabled={busy} onClick={() => social('lovable')}>Continue with Lovable</Button></div>
    </>}
    {ready && !user && <p className="mt-6 text-center text-sm text-muted-foreground">{role === 'student' ? 'Are you a teacher?' : 'Are you a student?'} <Link className="font-semibold text-primary" to={role === 'student' ? '/teacher-login' : '/student-login'}>{role === 'student' ? 'Teacher login' : 'Student login'}</Link></p>}
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}{message && <p role="status" className="mt-4 flex gap-2 text-sm text-success"><Mail className="h-5 w-5 shrink-0" />{message}</p>}
  </div>;
}