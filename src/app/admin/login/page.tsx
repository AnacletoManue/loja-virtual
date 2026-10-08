"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";

type State = { error?: string } | undefined;

const input = "w-full rounded-lg border bg-white px-3 py-2.5 outline-none focus:border-black";

export default function LoginPage() {
  const [state, action, pending] = useActionState<State, FormData>(loginAction, undefined);

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">Área do proprietário</h1>
      <p className="mt-1 text-sm text-neutral-500">Entre para gerir produtos e pedidos.</p>

      <form action={action} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input name="email" type="email" required autoComplete="username" className={input} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Senha</label>
          <input name="password" type="password" required autoComplete="current-password" className={input} />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
        )}

        <button
          disabled={pending}
          className="w-full rounded-lg bg-black py-2.5 font-medium text-white disabled:opacity-50"
        >
          {pending ? "A entrar..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
