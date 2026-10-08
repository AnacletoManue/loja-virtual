"use client";
import { useActionState } from "react";
import { updateAccountAction } from "./actions";

type State = { error?: string; ok?: string } | undefined;

const input = "w-full rounded-lg border bg-white px-3 py-2.5 outline-none focus:border-black";

export default function AccountPage() {
  const [state, action, pending] = useActionState<State, FormData>(updateAccountAction, undefined);

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Conta</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Altere o email ou a senha. Deixe em branco o que não quiser mudar.
        </p>
      </div>

      <form action={action} className="space-y-4 rounded-xl border bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Novo email</label>
          <input name="email" type="email" autoComplete="off" className={input} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Nova senha</label>
          <input name="newPassword" type="password" minLength={8} autoComplete="new-password" className={input} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Confirmar nova senha</label>
          <input name="confirmPassword" type="password" autoComplete="new-password" className={input} />
        </div>

        <hr />

        <div>
          <label className="mb-1 block text-sm font-medium">Senha atual (obrigatória)</label>
          <input name="currentPassword" type="password" required autoComplete="current-password" className={input} />
        </div>

        {state?.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
        {state?.ok && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{state.ok}</p>}

        <button disabled={pending} className="w-full rounded-lg bg-black py-2.5 font-medium text-white disabled:opacity-50">
          {pending ? "A guardar..." : "Guardar alterações"}
        </button>
      </form>
    </div>
  );
}
