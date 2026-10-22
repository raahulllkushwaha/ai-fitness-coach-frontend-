import { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowUpRight, CalendarDays, ChevronRight, Clock3, Flame, Footprints, Plus, RefreshCw, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { analyticsApi, getListFromPage, workoutApi } from '../lib/api.js';
import { apiErrorMessage } from '../lib/apiClient.js';
import { useAuthStore } from '../features/auth/authStore.js';
import { Button, EmptyState, ErrorBlock, GlassCard, PageHeader, SectionTitle, StatCard, LoadingBlock } from '../components/ui.jsx';

const now = new Date();
const iso = (date) => date.toISOString();
const number = (value, decimals = 0) => value == null || !Number.isFinite(Number(value)) ? '—' : Number(value).toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
const duration = (seconds = 0) => { const s = Math.max(0, Number(seconds) || 0); const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h ? `${h}h ${m}m` : `${m}m`; };
const dateLabel = (value) => { try { return format(new Date(value), 'dd MMM yyyy'); } catch { return '—'; } };

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [summary, setSummary] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const end = new Date(); const start = new Date(end.getTime() - 30 * 86400000);
    try {
      const results = await Promise.allSettled([
        analyticsApi.summary(iso(start), iso(end)),
        workoutApi.list({ page: 0, size: 5 }),
      ]);
      if (results[0].status === 'fulfilled') setSummary(results[0].value); else setError(apiErrorMessage(results[0].reason));
      if (results[1].status === 'fulfilled') setWorkouts(getListFromPage(results[1].value)); else setError((previous) => previous || apiErrorMessage(results[1].reason));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  const greeting = user?.firstName || user?.username || 'Athlete';

  return (
    <div className="page-stack">
      <PageHeader eyebrow="YOUR TRAINING SPACE" title={<>Make consistency<br className="desktop-break" /> your advantage<span className="title-period">.</span></>} description={`Welcome back, ${greeting}. Here’s your training picture over the last 30 days.`} action={<Button onClick={() => toast.info('Create your workout from the Workouts page.')}><Plus size={17} /> Quick action</Button>} />
      <div className="overview-banner"><div className="overview-banner-copy"><span className="banner-kicker"><span className="banner-dot" /> MONTHLY PULSE</span><h2>Progress is built<br />one session at a time.</h2><p>Review what you’ve done. Make the next session count.</p><Link to="/analytics" className="text-link">Explore analytics <ArrowUpRight size={15} /></Link></div><div className="banner-orbit"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit-core"><Zap size={31} /></div><div className="orbit-satellite" /></div><div className="banner-index">FORM+ / 30 DAY REVIEW</div></div>
      {loading ? <LoadingBlock label="Gathering your training data…" /> : error && !summary && !workouts.length ? <ErrorBlock message={error} onRetry={load} /> : <>
        <div className="stat-grid four"><StatCard label="Workouts" value={summary?.totalWorkouts ?? 0} icon={Footprints} delay={0.02} /><StatCard label="Total distance" value={summary?.totalDistanceMeters == null ? '—' : number(summary.totalDistanceMeters / 1000, 1)} unit={summary?.totalDistanceMeters == null ? '' : ' km'} icon={Activity} accent="blue" delay={0.08} /><StatCard label="Training time" value={duration(summary?.totalDurationSeconds)} icon={Clock3} accent="purple" delay={0.14} /><StatCard label="Calories burned" value={summary?.totalCalories == null ? '—' : number(summary.totalCalories)} unit={summary?.totalCalories == null ? '' : ' kcal'} icon={Flame} accent="orange" delay={0.2} /></div>
        <div className="dashboard-columns">
          <GlassCard className="table-card"><SectionTitle title="Recent sessions" subtitle="Your latest training activity" action={<Link to="/workouts" className="text-link">All workouts <ChevronRight size={15} /></Link>} />
            {workouts.length ? <div className="recent-list">{workouts.slice(0, 5).map((workout, index) => <div className="recent-row" key={workout.id ?? `${workout.startedAt}-${index}`}><div className={`activity-type activity-${String(workout.workoutType || 'other').toLowerCase()}`}><Activity size={17} /></div><div className="recent-main"><strong>{workout.notes || String(workout.workoutType || 'Workout').replaceAll('_', ' ')}</strong><span>{dateLabel(workout.startedAt)} · {workout.workoutType}</span></div><div className="recent-metric"><strong>{workout.distanceMeters > 0 ? `${number(workout.distanceMeters / 1000, 1)} km` : duration(workout.durationSeconds)}</strong><span>{workout.durationSeconds ? duration(workout.durationSeconds) : 'Duration n/a'}</span></div></div>)}</div> : <EmptyState icon={Activity} title="Your first session starts here" description="Add a workout manually or sync activities from Intervals.icu." action={<Link to="/workouts" className="text-link">Add a workout <ArrowUpRight size={15} /></Link>} />}
          </GlassCard>
          <GlassCard className="focus-card"><SectionTitle title="Keep your edge" subtitle="A few good next moves" /><div className="focus-item"><span className="focus-number">01</span><div><strong>Know your baseline</strong><p>Use analytics to see patterns in your last 30 days.</p><Link to="/analytics">View analytics <ArrowUpRight size={14} /></Link></div></div><div className="focus-item"><span className="focus-number">02</span><div><strong>Connect your data</strong><p>Bring activity history in from Intervals.icu.</p><Link to="/integrations">Manage integrations <ArrowUpRight size={14} /></Link></div></div><div className="focus-item"><span className="focus-number">03</span><div><strong>Build a repeatable plan</strong><p>Save your goals and preferences for future coaching.</p><Link to="/profile">Set your profile <ArrowUpRight size={14} /></Link></div></div><div className="focus-footer"><CalendarDays size={15} /><span>Consistency beats intensity without direction.</span></div></GlassCard>
        </div>
      </>}
      <div className="inline-note"><RefreshCw size={14} /> Dashboard metrics are calculated from your stored workouts. Some analytics may take a moment to update after a new workout.</div>
    </div>
  );
}
