import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { CalendarDays, ImagePlus, Plus, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { accountOptions, assignmentsOptions } from '@/lib/campus';
import { canPublish, validateAssignment, validateImage } from '@/lib/account';
import { Button } from './ui/button';
import { inputCls, Empty } from './AppShell';

export function AssignmentBoard({ compact = false }: { compact?: boolean }) {
  const { data: account } = useSuspenseQuery(accountOptions);
  const { data: assignments } = useSuspenseQuery(assignmentsOptions);
  const queryClient = useQueryClient();
  const teacher = canPublish(account.roles);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [due, setDue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const channel = supabase.channel('campus-assignments').on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => { void queryClient.invalidateQueries({ queryKey: assignmentsOptions.queryKey }); }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [queryClient]);
  async function create(e: FormEvent) {
    e.preventDefault(); setError(''); setNotice('');
    const invalid = validateAssignment(title, description, due) ?? (file ? validateImage(file) : null);
    if (invalid) { setError(invalid); return; }
    setBusy(true);
    let path: string | null = null;
    try {
      if (file) {
        const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
        path = `${account.id}/${crypto.randomUUID()}.${extension}`;
        const uploaded = await supabase.storage.from('assignment-images').upload(path, file, { contentType: file.type });
        if (uploaded.error) throw uploaded.error;
      }
      const result = await supabase.from('assignments').insert({ teacher_id: account.id, teacher_name: account.name, title: title.trim(), description: description.trim(), due_date: due, image_path: path });
      if (result.error) throw result.error;
      setTitle(''); setDescription(''); setDue(''); setFile(null);
      if (fileInput.current) fileInput.current.value = '';
      setNotice('Assignment published to all students.');
      await queryClient.invalidateQueries({ queryKey: assignmentsOptions.queryKey });
    } catch (e) {
      if (path) await supabase.storage.from('assignment-images').remove([path]);
      setError(e instanceof Error ? e.message : 'Assignment could not be published.');
    } finally { setBusy(false); }
  }
  async function remove(id: string, image: string | null) {
    if (!window.confirm('Delete this assignment for all students?')) return;
    setBusy(true); setError('');
    try {
      const result = await supabase.from('assignments').delete().eq('id', id);
      if (result.error) throw result.error;
      if (image) { const result = await supabase.storage.from('assignment-images').remove([image]); if (result.error) setNotice('Assignment deleted; its image could not be removed.'); }
      await queryClient.invalidateQueries({ queryKey: assignmentsOptions.queryKey });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not delete assignment.'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-6">
    {teacher && !compact && <section className="border-b pb-6"><h2 className="mb-4 font-display text-xl font-bold">New assignment</h2><form onSubmit={create} className="grid gap-4 md:grid-cols-2">
      <label className="text-sm font-medium">Title<input required maxLength={120} className={`${inputCls} mt-1`} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Physics lab report" /></label>
      <label className="text-sm font-medium">Due date<input required type="date" className={`${inputCls} mt-1`} value={due} onChange={e => setDue(e.target.value)} /></label>
      <label className="text-sm font-medium md:col-span-2">Description<textarea required maxLength={10000} rows={4} className={`${inputCls} mt-1`} value={description} onChange={e => setDescription(e.target.value)} placeholder="Assignment details" /></label>
      <div className="flex flex-wrap items-center gap-3"><input ref={fileInput} type="file" aria-label="Assignment image" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => { const next = e.target.files?.[0] ?? null; const invalid = next ? validateImage(next) : null; setError(invalid ?? ''); setFile(invalid ? null : next); }} /><Button type="button" variant="outline" onClick={() => fileInput.current?.click()}><ImagePlus />Attach photo</Button><span className="max-w-full break-all text-xs text-muted-foreground">{file?.name ?? 'Optional · JPG, PNG, WebP · 10 MB'}</span></div>
      <Button type="submit" disabled={busy} className="md:justify-self-end"><Plus />{busy ? 'Publishing…' : 'Publish assignment'}</Button>
    </form></section>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}{notice && <p role="status" className="text-sm text-success">{notice}</p>}
    <div className="flex items-center justify-between gap-3"><h2 className="font-display text-xl font-bold">{compact ? 'Upcoming assignments' : 'All assignments'} <span className="text-base text-muted-foreground">({assignments.length})</span></h2><Button variant="ghost" size="icon" title="Refresh assignments" aria-label="Refresh assignments" onClick={() => queryClient.invalidateQueries({ queryKey: assignmentsOptions.queryKey })}><RefreshCw /></Button></div>
    {assignments.length === 0 ? <Empty text="No assignments have been published yet." /> : <div className="grid gap-4 md:grid-cols-2">{(compact ? assignments.slice(0, 4) : assignments).map(a => <article key={a.id} className="min-w-0 overflow-hidden rounded-lg border bg-card">
      {a.image_url && <a href={a.image_url} target="_blank" rel="noreferrer" aria-label={`Open photo for ${a.title}`} className="block border-b bg-muted"><img src={a.image_url} alt={`Attachment for ${a.title}`} className="aspect-[16/9] w-full object-contain" loading="lazy" /></a>}
      <div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="break-words font-display text-xl font-bold">{a.title}</h3>{teacher && a.teacher_id === account.id && !compact && <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" title="Delete assignment" aria-label={`Delete ${a.title}`} disabled={busy} onClick={() => remove(a.id, a.image_path)}><Trash2 /></Button>}</div>
      <p className="mt-1 text-xs text-muted-foreground">Posted by {a.teacher_name}</p><p className="mt-4 whitespace-pre-wrap break-words text-sm">{a.description}</p><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-3"><span className="flex items-center gap-2 text-sm font-medium"><CalendarDays className="h-4 w-4 text-primary" />Due {a.due_date}</span>{a.image_url && <Button asChild variant="link" size="sm"><a href={a.image_url} target="_blank" rel="noreferrer">Open photo<ExternalLink /></a></Button>}</div></div>
    </article>)}</div>}
  </div>;
}