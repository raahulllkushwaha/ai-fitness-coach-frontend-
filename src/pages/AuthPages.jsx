import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { toast } from 'sonner';
import OrbScene from '../components/OrbScene.jsx';
import { Button, Input } from '../components/ui.jsx';
import { authApi } from '../lib/api.js';
import { apiErrorMessage, decodeJwt, findToken, unwrapApi } from '../lib/apiClient.js';
import { useAuthStore } from '../features/auth/authStore.js';

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your username or email.'),
  password: z.string().min(1, 'Password is required.'),
});
const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'Enter your first name.').max(100),
  lastName: z.string().trim().max(100).optional().or(z.literal('')),
  username: z.string().trim().min(3, 'Use at least 3 characters.').max(50).regex(/^[a-zA-Z0-9_.-]+$/, 'Use letters, numbers, dots, underscores or hyphens.'),
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.').max(72),
});

function AuthFrame({ children }) {
  return (
    <div className="auth-screen">
      <div className="auth-art"><OrbScene /><div className="auth-art-content"><Link to="/login" className="auth-brand"><span className="brand-mark"><Activity size={22} strokeWidth={2.5} /></span><span><strong>form<span>+</span></strong><small>AI FITNESS COACH</small></span></Link><div className="auth-pitch"><p className="eyebrow">TRAIN WITH INTENTION</p><h1>Your data.<br /><em>Your pace.</em><br />Your next level.</h1><p className="auth-pitch-copy">A smarter way to understand your training, build consistency, and make progress that lasts.</p><div className="auth-proof"><span className="proof-mark"><Activity size={17} /></span><span><strong>Every session tells a story.</strong><small>Bring yours into focus.</small></span></div></div><div className="auth-art-footer"><span>PERSONAL TRAINING INTELLIGENCE</span><span>01 / PERFORMANCE</span></div></div></div>
      <div className="auth-form-side"><div className="auth-mobile-brand"><span className="brand-mark"><Activity size={20} /></span><strong>form<span>+</span></strong></div><div className="auth-form-wrap">{children}</div><p className="auth-legal">By continuing, you agree to use your training data responsibly.</p></div>
    </div>
  );
}

function getUserFromPayload(payload, token) {
  const body = unwrapApi(payload);
  const candidate = body?.user || body?.account || body?.profile || body;
  const tokenUser = decodeJwt(token);
  return {
    ...tokenUser,
    ...(candidate && typeof candidate === 'object' ? candidate : {}),
    id: candidate?.id ?? candidate?.userId ?? tokenUser.id,
    username: candidate?.username ?? candidate?.name ?? tokenUser.username,
    email: candidate?.email ?? tokenUser.email,
    role: candidate?.role ?? tokenUser.role,
  };
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { identifier: location.state?.identifier || '', password: '' } });

  const onSubmit = async (values) => {
    setBusy(true);
    try {
      const response = await authApi.login({
      usernameOrEmail: values.identifier.trim(),
      password: values.password,
    });
      const token = findToken(response?.data);
      if (!token) throw new Error('Login response did not contain a JWT. Check the backend login response and API route in the README.');
      const user = getUserFromPayload(response?.data, token);
      setSession({ token, user });
      toast.success('Welcome back. Let’s get after it.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(apiErrorMessage(error, error?.message || 'Unable to sign in.'));
    } finally { setBusy(false); }
  };

  return (
    <AuthFrame>
      <div className="auth-heading"><p className="eyebrow">WELCOME BACK</p><h2>Good to have you<br />back<span>.</span></h2><p>Sign in to see how your training is adding up.</p></div>
      {searchParams.get('expired') && <div className="inline-alert">Your session expired. Please sign in again.</div>}
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input label="Username or email" placeholder="rahul or you@example.com" autoComplete="username" autoFocus error={errors.identifier?.message} {...register('identifier')} />
        <label className="field"><span className="field-label">Password</span><span className="password-wrap"><input className={`input ${errors.password ? 'input-error' : ''}`} type={showPassword ? 'text' : 'password'} placeholder="Enter your password" autoComplete="current-password" {...register('password')} /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>{errors.password && <span className="field-error">{errors.password.message}</span>}</label>
        <Button type="submit" loading={busy} className="auth-submit">Sign in <ArrowRight size={17} /></Button>
      </form>
      <div className="auth-switch">New around here? <Link to="/register">Create an account <ArrowRight size={14} /></Link></div>
      <div className="auth-mini-note"><LockKeyhole size={14} /> Your training data stays tied to your account.</div>
    </AuthFrame>
  );
}

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { firstName: '', lastName: '', username: '', email: '', password: '' } });

  const onSubmit = async (values) => {
    setBusy(true);
    try {
      await authApi.register(values);
      toast.success('Account created. Sign in to continue.');
      navigate('/login', { replace: true, state: { identifier: values.username } });
    } catch (error) {
      toast.error(apiErrorMessage(error, error?.message || 'Could not create your account.'));
    } finally { setBusy(false); }
  };

  return (
    <AuthFrame>
      <div className="auth-heading"><p className="eyebrow">START YOUR NEXT CHAPTER</p><h2>Build your<br />baseline<span>.</span></h2><p>Create your account and bring your training into focus.</p></div>
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-grid-two"><Input label="First name" placeholder="Rahul" autoComplete="given-name" error={errors.firstName?.message} {...register('firstName')} /><Input label="Last name" placeholder="Kushwaha" autoComplete="family-name" error={errors.lastName?.message} {...register('lastName')} /></div>
        <Input label="Username" placeholder="choose-a-username" autoComplete="username" error={errors.username?.message} {...register('username')} />
        <Input label="Email address" type="email" placeholder="you@example.com" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <label className="field"><span className="field-label">Password</span><span className="password-wrap"><input className={`input ${errors.password ? 'input-error' : ''}`} type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" autoComplete="new-password" {...register('password')} /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>{errors.password && <span className="field-error">{errors.password.message}</span>}</label>
        <Button type="submit" loading={busy} className="auth-submit">Create account <ArrowRight size={17} /></Button>
      </form>
      <div className="auth-switch">Already have an account? <Link to="/login">Sign in <ArrowRight size={14} /></Link></div>
      <div className="auth-mini-note"><Mail size={14} /> Use a real email you can access.</div>
    </AuthFrame>
  );
}
