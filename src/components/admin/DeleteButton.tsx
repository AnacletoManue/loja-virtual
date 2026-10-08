"use client";

export default function DeleteButton({
  action,
  message = "Remover este item? Esta ação não pode ser desfeita.",
}: {
  action: () => Promise<void>;
  message?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <button className="rounded-lg border px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
        Remover
      </button>
    </form>
  );
}
