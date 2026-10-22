import { useState } from 'react';
import { Bot, BrainCircuit, Send, Sparkles, UserRound } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { coachApi } from '../lib/api.js';
import { apiErrorMessage } from '../lib/apiClient.js';
import { Button, GlassCard, PageHeader } from '../components/ui.jsx';

const prompts = [
  { title: 'Understand my progress', text: 'Review my recent training and tell me what patterns stand out.' },
  { title: 'Plan my next session', text: 'Suggest a sensible next workout using only the workout data you have.' },
  { title: 'Recovery check-in', text: 'Based only on my recorded workout data, what should I consider for recovery?' },
];

export default function CoachPage() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hey. I’m your AI Fitness Coach. I can help interpret your training, spot patterns, and think through a sensible next step. I’ll work from the data you have recorded and call out when something is missing.' }]);
  const [input, setInput] = useState(''); const [busy, setBusy] = useState(false); const [recommendation, setRecommendation] = useState(null); const [recommendationBusy, setRecommendationBusy] = useState(false); const [recommendationError, setRecommendationError] = useState('');
  const send = async (message = input) => {
    const content = message.trim(); if (!content || busy) return; if (content.length > 2000) { toast.error('Keep your message under 2000 characters.'); return; }
    setMessages((current) => [...current, { role: 'user', content }]); setInput(''); setBusy(true);
    try { const response = await coachApi.chat(content); const answer = response?.message ?? response?.content ?? 'The coach returned an empty response.'; setMessages((current) => [...current, { role: 'assistant', content: answer, createdAt: new Date() }]); }
    catch (error) { const messageText = apiErrorMessage(error, 'The AI service is unavailable right now.'); setMessages((current) => [...current, { role: 'error', content: messageText }]); toast.error(messageText); }
    finally { setBusy(false); }
  };
  const generateRecommendation = async () => { setRecommendationBusy(true); setRecommendationError(''); const end = new Date(); const start = new Date(end.getTime() - 30 * 86400000); try { setRecommendation(await coachApi.recommendation(start.toISOString(), end.toISOString())); } catch (error) { const message = apiErrorMessage(error); setRecommendationError(message); toast.error(message); } finally { setRecommendationBusy(false); } };

  return <div className="page-stack coach-page">
    <PageHeader eyebrow="YOUR PERSONAL TRAINING PARTNER" title={<>Ask better<br className="desktop-break" /> questions<span className="title-period">.</span></>} description="A thoughtful read on your training—grounded in your recorded data." action={<div className="coach-live-pill"><span className="status-dot" /> AI assistant</div>} />
    <div className="coach-layout"><GlassCard className="chat-card"><div className="chat-header"><div className="coach-avatar"><BrainCircuit size={23} /></div><div><strong>AI Fitness Coach</strong><span><span className="status-dot" /> Connected to your account</span></div><span className="chat-header-tag">PRIVATE CHAT</span></div>
      <div className="chat-messages">{messages.map((message, index) => <div className={`chat-message chat-${message.role}`} key={`${message.role}-${index}`}><div className="chat-message-avatar">{message.role === 'user' ? <UserRound size={16} /> : <Sparkles size={16} />}</div><div className="chat-bubble"><p>{message.content}</p>{message.createdAt && <small>{formatDistanceToNow(message.createdAt, { addSuffix: true })}</small>}</div></div>)}{busy && <div className="chat-message chat-assistant"><div className="chat-message-avatar"><Sparkles size={16} /></div><div className="chat-bubble thinking-bubble"><span /><span /><span /><small>Thinking…</small></div></div>}</div>
      <div className="suggestion-row">{prompts.map((prompt) => <button key={prompt.title} onClick={() => send(prompt.text)} disabled={busy}>{prompt.title}</button>)}</div>
      <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); send(); }}><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about your training…" rows={2} maxLength={2000} disabled={busy} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} /><div className="composer-bottom"><span>Enter to send · Shift + Enter for a new line</span><Button type="submit" loading={busy} disabled={!input.trim()}><Send size={15} /> Send</Button></div></form>
    </GlassCard>
    <div className="coach-side-column"><GlassCard className="coach-callout"><span className="callout-icon"><Sparkles size={18} /></span><p className="eyebrow">COACHING PRINCIPLE</p><h3>Context before conclusions.</h3><p>Your coach should explain what the data suggests—and what it cannot tell us. It won’t diagnose medical conditions.</p><div className="callout-rule" /><span className="mono-caption">RESPONSE QUALITY / DATA-GROUNDED</span></GlassCard><GlassCard className="recommendation-card"><div className="recommendation-title"><div><p className="eyebrow">30-DAY REVIEW</p><h3>Coach’s assessment</h3></div><span className="recommendation-icon"><Bot size={19} /></span></div>{recommendation ? <div className="recommendation-content"><p>{recommendation.overallAssessment}</p>{recommendation.keyInsights?.length > 0 && <><strong>Key insights</strong><ul>{recommendation.keyInsights.map((insight, index) => <li key={index}>{insight}</li>)}</ul></>}{recommendation.recommendations?.length > 0 && <><strong>Recommended next steps</strong><ul>{recommendation.recommendations.map((item, index) => <li key={index}>{item}</li>)}</ul></>}{recommendation.recoveryAdvice && <div className="recovery-advice"><strong>Recovery</strong><p>{recommendation.recoveryAdvice}</p></div>}{recommendation.nextWorkoutSuggestion && <div className="next-workout"><strong>Next workout</strong><p>{recommendation.nextWorkoutSuggestion}</p></div>}</div> : <><p className="muted-copy">Generate a structured review of your recent training. This makes an AI API call and may use your available quota.</p>{recommendationError && <p className="field-error">{recommendationError}</p>}<Button variant="outline" block loading={recommendationBusy} onClick={generateRecommendation}><Sparkles size={15} /> Generate assessment</Button></>}</GlassCard></div></div>
    <div className="inline-note"><Sparkles size={14} /> AI responses may be delayed or unavailable when the API quota is exhausted. The workout and analytics commands do not need Gemini.</div>
  </div>;
}
