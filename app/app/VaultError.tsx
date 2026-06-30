'use client';

interface VaultErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function VaultError({ error, reset }: VaultErrorProps) {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-lg font-bold">Something went wrong in your vault</h2>
      <p className="text-sm text-slate-400 max-w-md text-center">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="btn-primary"
      >
        Try again
      </button>
    </div>
  );
}
