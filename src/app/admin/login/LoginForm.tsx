"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/app/admin/login/actions";

const initialState: {
  error: string | null;
} = {
  error: null,
};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);

  return (
    <form action={formAction} className="mt-7 space-y-5">
      {state.error ? (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {state.error}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-black text-[var(--text-primary)]"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-12 w-full rounded-2xl border border-[#8FA2B8] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)] focus:shadow-[0_0_0_3px_rgba(2,100,169,0.16)]"
          placeholder="admin@credifer.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-black text-[var(--text-primary)]"
        >
          Contraseña
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 w-full rounded-2xl border border-[#8FA2B8] bg-white px-4 text-sm font-bold text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--brand-blue)] focus:shadow-[0_0_0_3px_rgba(2,100,169,0.16)]"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="tap-feedback inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--brand-blue)] px-6 text-sm font-black text-white shadow-[0_12px_26px_rgba(2,100,169,0.22)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] disabled:cursor-not-allowed disabled:opacity-70 focus-ring"
      >
        {pending ? "Ingresando..." : "Ingresar al panel"}
      </button>
    </form>
  );
}
