import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dumbbell, Info, Save, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../features/auth/authStore.js';
import { Button, GlassCard, Input, PageHeader, Select } from '../components/ui.jsx';

const KEY = 'aifc-fitness-preferences-v1';
const schema = z.object({
  displayName: z.string().trim().min(1, 'Enter a display name.').max(80),
  goal: z.enum(['GENERAL_FITNESS', 'BUILD_STRENGTH', 'IMPROVE_ENDURANCE', 'LOSE_FAT', 'GAIN_MUSCLE', 'RUNNING_PERFORMANCE']),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  preferredActivities: z.string().max(200),
  sessionsPerWeek: z.coerce.number().int().min(1).max(14),
  equipment: z.string().max(200),
  timezone: z.string().min(1),
});

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user); const [savedAt, setSavedAt] = useState(null);
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({ resolver: zodResolver(schema), defaultValues: { displayName: user?.firstName || user?.username || '', goal: 'GENERAL_FITNESS', level: 'BEGINNER', preferredActivities: 'Walking, running', sessionsPerWeek: 3, equipment: 'Bodyweight', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' } });
  useEffect(() => { try { const stored = localStorage.getItem(KEY); if (stored) reset({ ...JSON.parse(stored) }); } catch { /* Ignore invalid local preference data. */ } }, [reset]);
  const save = (values) => { try { localStorage.setItem(KEY, JSON.stringify(values)); setSavedAt(new Date()); reset(values); toast.success('Preferences saved on this device.'); } catch { toast.error('Could not save preferences in this browser.'); } };

  return <div className="page-stack">
    <PageHeader eyebrow="YOUR BASELINE" title={<>Training that<br className="desktop-break" /> fits your life<span className="title-period">.</span></>} description="Set the context that will make future coaching more personal." />
    <div className="profile-layout"><GlassCard className="profile-form-card"><div className="form-section-heading"><span className="section-icon"><UserRound size={18} /></span><div><h2>Personal training profile</h2><p>Preferences for how you want to train.</p></div></div><form className="profile-form" onSubmit={handleSubmit(save)}><Input label="Display name" autoComplete="name" error={errors.displayName?.message} {...register('displayName')} /><div className="form-grid-two"><Select label="Primary goal" {...register('goal')}><option value="GENERAL_FITNESS">General fitness</option><option value="BUILD_STRENGTH">Build strength</option><option value="IMPROVE_ENDURANCE">Improve endurance</option><option value="LOSE_FAT">Lose fat</option><option value="GAIN_MUSCLE">Gain muscle</option><option value="RUNNING_PERFORMANCE">Running performance</option></Select><Select label="Current level" {...register('level')}><option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option></Select></div><Input label="Preferred activities" placeholder="Running, walking, strength" error={errors.preferredActivities?.message} {...register('preferredActivities')} /><div className="form-grid-two"><Input label="Sessions per week" type="number" min="1" max="14" error={errors.sessionsPerWeek?.message} {...register('sessionsPerWeek')} /><Input label="Equipment available" placeholder="Dumbbells, bodyweight…" error={errors.equipment?.message} {...register('equipment')} /></div><Input label="Timezone" placeholder="Asia/Kolkata" error={errors.timezone?.message} {...register('timezone')} /><div className="profile-save-row"><span>{savedAt ? `Saved locally at ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Personalization preferences'}</span><Button type="submit" disabled={!isDirty}><Save size={16} /> Save preferences</Button></div></form></GlassCard><div className="profile-side"><GlassCard className="profile-info-card"><span className="profile-info-icon"><Info size={20} /></span><h3>What this changes today</h3><p>These preferences are stored in this browser only. Server-side fitness-profile endpoints have not been implemented yet, so these values are not synced to your account or sent to the AI Coach.</p><div className="info-divider" /><span className="mono-caption">LOCAL DEVICE · NOT CLOUD SYNCED</span></GlassCard><GlassCard className="profile-info-card goal-card"><span className="profile-info-icon lime-mini"><Dumbbell size={20} /></span><h3>Build a useful baseline</h3><p>Goals, experience, equipment and weekly availability will become inputs for personalized coaching once the backend profile API is added.</p><div className="goal-steps"><span>01 / PROFILE</span><span>02 / PLAN</span><span>03 / PROGRESS</span></div></GlassCard></div></div>
  </div>;
}
