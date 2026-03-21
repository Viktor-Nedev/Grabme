import { useState } from 'react';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertBanner } from '@/components/common/AlertBanner';
import { RoleBadge } from '@/components/common/RoleBadge';
import { FormField, inputClassName } from '@/components/forms/FormField';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';
import { USER_ROLES } from '@/utils/constants';

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { login, register, loginAsDemo } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('maya@grabme.app');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = mode === 'login' ? login({ email, role }) : register({ name, email, role });

    if (!result.success) {
      setMessage(result.message ?? 'Something went wrong.');
      return;
    }

    navigate(redirect && result.redirectTo !== '/onboarding' ? redirect : result.redirectTo);
  };

  const handleDemo = (demoRole: UserRole) => {
    const result = loginAsDemo(demoRole);
    navigate(redirect ?? result.redirectTo);
  };

  return (
    <section className="section-shell py-10 md:py-16">
      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="surface-card overflow-hidden">
          <div className="bg-[linear-gradient(135deg,rgba(229,57,53,0.96),rgba(255,193,7,0.9))] p-8 text-white">
            <p className="text-sm uppercase tracking-[0.22em] text-white/70">Grabme Access</p>
            <h1 className="mt-4 font-display text-4xl leading-tight">Sign in to respond, request, and coordinate food relief.</h1>
            <p className="mt-4 max-w-xl text-sm text-white/85">
              Role-based workspaces keep public map browsing open while protecting request creation, donation management,
              events, and organization operations.
            </p>
          </div>
          <div className="grid gap-4 p-8 md:grid-cols-2">
            <div className="surface-muted p-5">
              <LockKeyhole className="size-5 text-brand-red" />
              <h2 className="mt-4 font-display text-2xl">For regular users</h2>
              <p className="mt-2 text-sm text-brand-gray">
                Browse nearby food, create requests, save your location, and track pickup opportunities.
              </p>
            </div>
            <div className="surface-muted p-5">
              <Sparkles className="size-5 text-brand-red" />
              <h2 className="mt-4 font-display text-2xl">For organizations</h2>
              <p className="mt-2 text-sm text-brand-gray">
                Manage donations, events, urgent request coverage, impact stats, and AI-powered prioritization.
              </p>
            </div>
          </div>
        </div>

        <div className="surface-card p-8">
          <div className="flex gap-2 rounded-full bg-brand-cream/70 p-1">
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab)}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold capitalize ${
                  mode === tab ? 'bg-white text-brand-ink shadow-sm' : 'text-brand-gray'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {USER_ROLES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setRole(option.value);
                  setEmail(option.value === 'user' ? 'maya@grabme.app' : 'hope@grabme.org');
                }}
                className={`rounded-[22px] border p-4 text-left transition ${
                  role === option.value ? 'border-brand-red bg-brand-red/5' : 'border-brand-ink/8 bg-white'
                }`}
              >
                <RoleBadge role={option.value} />
                <p className="mt-3 font-semibold">{option.label}</p>
                <p className="mt-1 text-sm text-brand-gray">{option.description}</p>
              </button>
            ))}
          </div>

          {message ? <div className="mt-6"><AlertBanner title="Auth note" message={message} tone="warning" /></div> : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {mode === 'register' ? (
              <FormField label={role === 'organization' ? 'Organization contact name' : 'Full name'}>
                <input
                  className={inputClassName}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={role === 'organization' ? 'Hope Harvest Network' : 'Maya Johnson'}
                  required
                />
              </FormField>
            ) : null}

            <FormField label="Email">
              <input
                type="email"
                className={inputClassName}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
              />
            </FormField>

            <button type="submit" className="btn-primary w-full">
              {mode === 'login' ? 'Login to Grabme' : 'Create Account'}
              <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <button type="button" onClick={() => handleDemo('user')} className="btn-ghost text-sm">
              Continue as Demo User
            </button>
            <button type="button" onClick={() => handleDemo('organization')} className="btn-secondary text-sm">
              Continue as Demo Org
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
