export type CampusRole = 'student' | 'teacher' | 'admin';
export function canPublish(roles: readonly CampusRole[]) {
  return roles.includes('teacher');
}
export function validateAssignment(title: string, description: string, due: string) {
  if (!title.trim() || title.trim().length > 120) return 'Enter a title between 1 and 120 characters.';
  if (!description.trim() || description.trim().length > 10000) return 'Enter an assignment description (up to 10,000 characters).';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) return 'Choose a due date.';
  return null;
}
export function validateImage(file: { type: string; size: number }) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Choose a JPG, PNG or WebP image.';
  if (file.size > 10 * 1024 * 1024) return 'Choose an image smaller than 10 MB.';
  return null;
}