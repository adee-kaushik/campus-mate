import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CampusRole } from './account';

export const accountOptions = queryOptions({
  queryKey: ['campus-account'],
  queryFn: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('Please sign in.');
    const [profile, roles, request] = await Promise.all([
      supabase.from('profiles').select('display_name').eq('id', user.id).single(),
      supabase.from('user_roles').select('role').eq('user_id', user.id),
      supabase.from('teacher_requests').select('status').eq('user_id', user.id).maybeSingle(),
    ]);
    if (profile.error) throw profile.error;
    if (roles.error) throw roles.error;
    if (request.error) throw request.error;
    return { id: user.id, name: profile.data.display_name, roles: roles.data.map(r => r.role) as CampusRole[], request: request.data?.status };
  },
});

export const assignmentsOptions = queryOptions({
  queryKey: ['shared-assignments'],
  refetchOnWindowFocus: true,
  queryFn: async () => {
    const { data, error } = await supabase.from('assignments').select('*').order('due_date').limit(1000);
    if (error) throw error;
    return Promise.all(data.map(async a => {
      if (!a.image_path) return { ...a, image_url: null };
      const image = await supabase.storage.from('assignment-images').createSignedUrl(a.image_path, 3600);
      if (image.error) throw image.error;
      return { ...a, image_url: image.data.signedUrl };
    }));
  },
  staleTime: 30000,
  refetchInterval: 15 * 60 * 1000,
});