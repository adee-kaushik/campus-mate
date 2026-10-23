import { createFileRoute, Link } from '@tanstack/react-router';
import { GraduationCap, School, ArrowRight } from 'lucide-react';
import { useAccount } from '@/components/AccountProvider';
import { cardCls } from '@/components/AppShell';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [{ title: 'Login — CampusMate' }, { name: 'description', content: 'Choose student or teacher login for CampusMate.' }, { property: 'og:title', content: 'CampusMate Login' }, { property: 'og:type', content: 'website' }] }),
  component: AuthChooser,
});

function AuthChooser() {
  const { user, ready } = useAccount();
  return <div className="mx-auto max-w-2xl py-8 md:py-12">
    <div className="mb-8 text-center"><GraduationCap className="mx-auto mb-3 h-10 w-10 text-primary" /><h1 className="font-display text-4xl font-bold">CampusMate</h1><p className="mt-2 text-muted-foreground">Choose how you want to sign in.</p></div>
    {ready && user ? <div className="space-y-4 text-center"><h2 className="font-display text-2xl font-bold">Welcome back</h2><Button asChild className="w-full"><Link to="/dashboard">Open your dashboard <ArrowRight /></Link></Button></div> : <div className="grid gap-4 md:grid-cols-2">
      <Link to="/student-login" className={`${cardCls} block text-center transition hover:-translate-y-0.5`}><GraduationCap className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-3 font-display text-2xl font-bold">Student Login</h2><p className="mt-1 text-sm text-muted-foreground">View assignments shared by your teachers.</p></Link>
      <Link to="/teacher-login" className={`${cardCls} block text-center transition hover:-translate-y-0.5`}><School className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-3 font-display text-2xl font-bold">Teacher Login</h2><p className="mt-1 text-sm text-muted-foreground">Publish assignments (needs admin approval).</p></Link>
    </div>}
  </div>;
}
