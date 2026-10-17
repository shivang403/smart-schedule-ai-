import React, { FormEvent, useState } from 'react';
import { AlertCircle, CalendarDays, LoaderCircle, LockKeyhole } from 'lucide-react';
import { signIn } from '../lib/firebase';

interface SignInViewProps {
  configError: string | null;
}

export const SignInView: React.FC<SignInViewProps> = ({ configError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (signInError) {
      const code = (signInError as { code?: string })?.code;
      setError(
        code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password'
          ? 'Email or password is incorrect.'
          : code === 'auth/too-many-requests'
          ? 'Too many attempts. Wait a while, then try again.'
          : (signInError as Error)?.message || 'Could not sign in. Check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
        <div className="bg-slate-900 px-8 py-7 text-white">
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-indigo-500">
            <CalendarDays className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Smart Schedule AI</h1>
          <p className="mt-2 text-sm text-slate-300">Sign in to manage your academic schedule.</p>
        </div>

        <form className="space-y-5 p-8" onSubmit={handleSubmit}>
          {configError && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Firebase is not configured: {configError}
            </div>
          )}

          {error && (
            <div role="alert" className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input
              autoComplete="username"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={Boolean(configError) || isSubmitting}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={Boolean(configError) || isSubmitting}
            />
          </label>

          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={Boolean(configError) || isSubmitting}
          >
            {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-5 w-5" />}
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-xs leading-5 text-slate-500">
            Accounts are created by the administrator. There is no public sign-up.
          </p>
        </form>
      </section>
    </main>
  );
};
