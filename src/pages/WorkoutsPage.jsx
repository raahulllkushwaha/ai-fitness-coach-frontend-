import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, CalendarDays, ChevronLeft, ChevronRight, Clock3, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { apiErrorMessage } from '../lib/apiClient.js';
import { getListFromPage, workoutApi, unwrapEntity } from '../lib/api.js';
import { Button, EmptyState, ErrorBlock, GlassCard, Input, LoadingBlock, Modal, PageHeader, Select } from '../components/ui.jsx';

const types = ['STRENGTH', 'RUNNING', 'CYCLING', 'WALKING', 'SWIMMING', 'HIKING', 'OTHER'];
const optionalNumber = (schema) => z.preprocess(
  (value) => value === '' || value === null || value === undefined ? undefined : Number(value),
  schema.optional(),
);
const createSchema = z.object({
  workoutType: z.enum(types),
  startedAt: z.string().min(1, 'Choose a start time.'),
  durationMinutes: z.coerce.number().int().min(1, 'Duration must be at least 1 minute.').max(1440, 'Duration must be 24 hours or less.'),
  distanceKm: optionalNumber(z.number().min(0).max(1000)),
  elevation: optionalNumber(z.number().min(0).max(100000)),
  averageHeartRate: optionalNumber(z.number().int().min(1).max(250)),
  maxHeartRate: optionalNumber(z.number().int().min(1).max(300)),
  calories: optionalNumber(z.number().min(0).max(100000)),
  notes: z.string().max(500, 'Keep notes under 500 characters.').optional(),
});
const localDateTimeValue = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};
const fmtDuration = (seconds = 0) => { const total = Math.max(0, Number(seconds) || 0); const h = Math.floor(total / 3600); const m = Math.floor((total % 3600) / 60); return h ? `${h}h ${m}m` : `${m}m`; };
const num = (value, decimals = 1) => Number(value).toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });

function WorkoutForm({ onClose, onCreated }) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { workoutType: 'RUNNING', startedAt: localDateTimeValue(new Date(Date.now() - 30 * 60000)), durationMinutes: 30, distanceKm: '', elevation: '', averageHeartRate: '', maxHeartRate: '', calories: '', notes: '' },
  });
  const [busy, setBusy] = useState(false);
  const avg = watch('averageHeartRate'); const max = watch('maxHeartRate');
  const submit = async (values) => {
    if (avg !== '' && max !== '' && Number(max) < Number(avg)) { toast.error('Maximum heart rate must be at least average heart rate.'); return; }
    setBusy(true);
    try {
      const start = new Date(values.startedAt);
      const durationSeconds = Number(values.durationMinutes) * 60;
      const optional = (value) => value === '' || value == null ? null : Number(value);
      const distanceMeters = optional(values.distanceKm) == null ? null : Number(values.distanceKm) * 1000;
      const response = await workoutApi.create({
        workoutType: values.workoutType,
        startedAt: start.toISOString(),
        endedAt: new Date(start.getTime() + durationSeconds * 1000).toISOString(),
        durationSeconds, distanceMeters,
        elevationGainMeters: optional(values.elevation),
        averageHeartRate: optional(values.averageHeartRate),
        maxHeartRate: optional(values.maxHeartRate),
        calories: optional(values.calories),
        averagePaceSecondsPerKm: distanceMeters > 0 ? durationSeconds * 1000 / distanceMeters : null,
        source: 'MANUAL', externalId: null, notes: values.notes?.trim() || null,
      });
      unwrapEntity(response); toast.success('Workout saved. Analytics will update shortly.'); onCreated(); onClose();
    } catch (error) { toast.error(apiErrorMessage(error, 'Could not save workout.')); }
    finally { setBusy(false); }
  };
  return <form className="workout-form" onSubmit={handleSubmit(submit)} noValidate>
    <div className="form-grid-two"><Select label="Workout type" {...register('workoutType')}>{types.map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}</Select><Input label="Start date & time" type="datetime-local" error={errors.startedAt?.message} {...register('startedAt')} /></div>
    <div className="form-grid-three"><Input label="Duration (minutes)" type="number" min="1" error={errors.durationMinutes?.message} {...register('durationMinutes')} /><Input label="Distance (km)" type="number" min="0" step="0.01" placeholder="Optional" error={errors.distanceKm?.message} {...register('distanceKm')} /><Input label="Elevation (m)" type="number" min="0" placeholder="Optional" error={errors.elevation?.message} {...register('elevation')} /></div>
    <div className="form-grid-three"><Input label="Avg HR (bpm)" type="number" placeholder="Optional" error={errors.averageHeartRate?.message} {...register('averageHeartRate')} /><Input label="Max HR (bpm)" type="number" placeholder="Optional" error={errors.maxHeartRate?.message} {...register('maxHeartRate')} /><Input label="Calories" type="number" placeholder="Optional" error={errors.calories?.message} {...register('calories')} /></div>
    <label className="field"><span className="field-label">Notes</span><textarea className="input textarea" rows="3" placeholder="How did it feel? Any notes for later?" {...register('notes')} />{errors.notes && <span className="field-error">{errors.notes.message}</span>}</label>
    <div className="modal-actions"><Button variant="ghost" type="button" onClick={onClose}>Cancel</Button><Button type="submit" loading={busy}><Plus size={16} /> Save workout</Button></div>
  </form>;
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]); const [pageData, setPageData] = useState(null); const [page, setPage] = useState(0); const [typeFilter, setTypeFilter] = useState('ALL'); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [showCreate, setShowCreate] = useState(false); const [deletingId, setDeletingId] = useState(null);
  const load = useCallback(async () => { setLoading(true); setError(''); try { const result = await workoutApi.list({ page, size: 10, sort: 'startedAt,desc', workoutType: typeFilter }); setPageData(result); setWorkouts(getListFromPage(result)); } catch (err) { setError(apiErrorMessage(err)); } finally { setLoading(false); } }, [page, typeFilter]);
  useEffect(() => { load(); }, [load]);
  const totalPages = pageData?.totalPages ?? 1; const currentCount = pageData?.totalElements ?? workouts.length;
  const handleDelete = async (workout) => { if (!window.confirm(`Delete this ${String(workout.workoutType || 'workout').toLowerCase()} session? This action cannot be undone.`)) return; setDeletingId(workout.id); try { await workoutApi.remove(workout.id); toast.success('Workout deleted. Analytics will update shortly.'); await load(); } catch (error) { toast.error(apiErrorMessage(error, 'Could not delete workout.')); } finally { setDeletingId(null); } };
  return <div className="page-stack">
    <PageHeader eyebrow="TRAINING LOG" title={<>Every session<br className="desktop-break" /> counts<span className="title-period">.</span></>} description="Your workout history, in one clean view." action={<Button onClick={() => setShowCreate(true)}><Plus size={17} /> Add workout</Button>} />
    <div className="filter-row"><div className="filter-pills">{['ALL', ...types].map((type) => <button key={type} className={`filter-pill ${typeFilter === type ? 'selected' : ''}`} onClick={() => { setPage(0); setTypeFilter(type); }}>{type === 'ALL' ? 'All sessions' : type.replaceAll('_', ' ')}</button>)}</div><span className="result-count">{currentCount} {currentCount === 1 ? 'session' : 'sessions'}</span></div>
    {loading ? <LoadingBlock label="Loading workouts…" /> : error ? <ErrorBlock message={error} onRetry={load} /> : <GlassCard className="workout-table-card">
      {workouts.length ? <><div className="workout-table-head"><span>SESSION</span><span>DATE</span><span>DURATION</span><span>DISTANCE</span><span>SOURCE</span><span /></div>
      {workouts.map((workout, index) => <div className="workout-table-row" key={workout.id ?? index}><div className="session-cell"><span className={`activity-type activity-${String(workout.workoutType || 'other').toLowerCase()}`}><Activity size={17} /></span><span><strong>{workout.notes || String(workout.workoutType || 'Workout').replaceAll('_', ' ')}</strong><small>{workout.workoutType?.replaceAll('_', ' ') || 'Workout'}</small></span></div><div className="table-date"><CalendarDays size={14} />{workout.startedAt ? format(new Date(workout.startedAt), 'dd MMM yyyy · HH:mm') : '—'}</div><div className="table-value"><Clock3 size={14} />{fmtDuration(workout.durationSeconds)}</div><div className="table-value">{workout.distanceMeters > 0 ? `${num(workout.distanceMeters / 1000)} km` : '—'}</div><div><span className={`source-badge source-${String(workout.source || 'manual').toLowerCase()}`}>{String(workout.source || 'MANUAL').replaceAll('_', ' ')}</span></div><div><button className="icon-button danger-icon" disabled={deletingId === workout.id} title="Delete workout" aria-label={`Delete workout ${workout.id}`} onClick={() => handleDelete(workout)}><Trash2 size={16} /></button></div></div>)}
      <div className="pagination-row"><span>Page {page + 1} of {Math.max(1, totalPages)}</span><div><Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage((value) => Math.max(0, value - 1))}><ChevronLeft size={15} /> Previous</Button><Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight size={15} /></Button></div></div></> : <EmptyState icon={Activity} title="No workouts yet" description="Your training log will appear here once you create a session or sync Intervals.icu." action={<Button onClick={() => setShowCreate(true)}><Plus size={16} /> Add first workout</Button>} />}
      </GlassCard>}
    <div className="inline-note"><RefreshCw size={14} /> Analytics are processed asynchronously after workout events. Give the backend a moment to update.</div>
    {showCreate && <Modal title="Log a workout" description="Add a completed session to your training history." onClose={() => setShowCreate(false)}><WorkoutForm onClose={() => setShowCreate(false)} onCreated={load} /></Modal>}
  </div>;
}
