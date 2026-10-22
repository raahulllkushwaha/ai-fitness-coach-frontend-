import { useCallback, useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { Activity, BarChart3, Clock3, Flame, Gauge, RefreshCw } from 'lucide-react';
import { analyticsApi } from '../lib/api.js';
import { apiErrorMessage } from '../lib/apiClient.js';
import { Button, ErrorBlock, GlassCard, LoadingBlock, PageHeader, SectionTitle, StatCard } from '../components/ui.jsx';

const formatDuration = (seconds = 0) => { const s = Math.max(0, Number(seconds) || 0); const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h ? `${h}h ${m}m` : `${m}m`; };
const formatNumber = (value, digits = 1) => value == null || !Number.isFinite(Number(value)) ? '—' : Number(value).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
const formatPace = (value) => { if (value == null || value <= 0) return '—'; const sec = Math.round(value); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; };

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    const end = new Date(); const start = new Date(end.getTime() - days * 86400000);
    try { setSummary(await analyticsApi.summary(start.toISOString(), end.toISOString())); }
    catch (err) { setError(apiErrorMessage(err)); }
    finally { setLoading(false); }
  }, [days]);
  useEffect(() => { load(); }, [load]);

  const breakdown = summary?.workoutTypeBreakdown || {};
  const breakdownEntries = Object.entries(breakdown).filter(([, value]) => Number(value) > 0);
  const chartOptions = useMemo(() => ({
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent', fontFamily: 'Manrope, sans-serif', foreColor: '#8b95a5' },
    theme: { mode: 'dark' }, plotOptions: { bar: { borderRadius: 6, columnWidth: '42%', distributed: true } },
    colors: ['#b9f36b', '#8fc9ff', '#b2a0ff', '#ffbf78', '#ff8ba1', '#6ad9cb', '#8e98a8'],
    dataLabels: { enabled: false }, grid: { borderColor: '#252c35', strokeDashArray: 4 },
    xaxis: { categories: breakdownEntries.map(([key]) => key.replaceAll('_', ' ')), axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { min: 0, forceNiceScale: true, labels: { formatter: (value) => Math.round(value) } },
    tooltip: { theme: 'dark' }, legend: { show: false },
  }), [breakdownEntries]);

  return <div className="page-stack">
    <PageHeader eyebrow="PERFORMANCE INTELLIGENCE" title={<>Data with<br className="desktop-break" /> direction<span className="title-period">.</span></>} description="Look beyond individual sessions to understand your training patterns." action={<div className="range-switcher">{[7, 30, 90].map((value) => <button key={value} className={days === value ? 'selected' : ''} onClick={() => setDays(value)}>{value}D</button>)}</div>} />
    {loading ? <LoadingBlock label="Calculating your metrics…" /> : error ? <ErrorBlock message={error} onRetry={load} /> : <>
      <div className="stat-grid four"><StatCard label="Completed workouts" value={summary?.totalWorkouts ?? 0} icon={Activity} /><StatCard label="Total distance" value={summary?.totalDistanceMeters == null ? '—' : formatNumber(summary.totalDistanceMeters / 1000)} unit={summary?.totalDistanceMeters == null ? '' : ' km'} icon={Gauge} accent="blue" delay={0.05} /><StatCard label="Time invested" value={formatDuration(summary?.totalDurationSeconds)} icon={Clock3} accent="purple" delay={0.1} /><StatCard label="Calories" value={summary?.totalCalories == null ? '—' : formatNumber(summary.totalCalories, 0)} unit={summary?.totalCalories == null ? '' : ' kcal'} icon={Flame} accent="orange" delay={0.15} /></div>
      <div className="analytics-grid"><GlassCard className="chart-card"><SectionTitle title="Training mix" subtitle={`Workout distribution · ${days} days`} />{breakdownEntries.length ? <Chart options={chartOptions} series={[{ name: 'Workouts', data: breakdownEntries.map(([, value]) => Number(value)) }]} type="bar" height={300} /> : <div className="chart-empty"><BarChart3 size={28} /><strong>No training mix yet</strong><span>Workouts with analytics in this date range will appear here.</span></div>}</GlassCard><GlassCard className="recovery-card"><SectionTitle title="Intensity snapshot" subtitle="Metrics available from your recorded workouts" /><div className="metric-line"><div><span>Average heart rate</span><strong>{summary?.averageHeartRate == null ? '—' : `${formatNumber(summary.averageHeartRate, 0)} bpm`}</strong></div><div className="metric-mini-icon blue-mini"><Activity size={17} /></div></div><div className="metric-line"><div><span>Maximum heart rate</span><strong>{summary?.maxHeartRate == null ? '—' : `${formatNumber(summary.maxHeartRate, 0)} bpm`}</strong></div><div className="metric-mini-icon red-mini"><Flame size={17} /></div></div><div className="metric-line"><div><span>Average pace</span><strong>{summary?.averagePaceSecondsPerKm == null ? '—' : `${formatPace(summary.averagePaceSecondsPerKm)} min/km`}</strong></div><div className="metric-mini-icon lime-mini"><Gauge size={17} /></div></div><div className="metric-disclaimer">Only recorded metrics are shown. Missing sensor values are not estimated.</div></GlassCard></div>
      <GlassCard className="breakdown-card"><SectionTitle title="Workout breakdown" subtitle="Count by activity type" />{breakdownEntries.length ? <div className="breakdown-list">{breakdownEntries.map(([type, count], index) => { const total = Math.max(1, Number(summary?.totalWorkouts) || 0); const percent = Math.min(100, Number(count) / total * 100); return <div className="breakdown-row" key={type}><div className="breakdown-row-top"><span>{type.replaceAll('_', ' ')}</span><strong>{count} <small>sessions</small></strong></div><div className="progress-track"><div className={`progress-fill progress-${index % 5}`} style={{ width: `${percent}%` }} /></div></div>; })}</div> : <p className="muted-copy">No workouts in this range. Try expanding to 90 days or adding a session.</p>}</GlassCard>
    </>}
    <div className="inline-note"><RefreshCw size={14} /> Analytics are generated asynchronously by the backend after workout events.</div>
  </div>;
}
