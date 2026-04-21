"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Props {
  nextPath: string;
}

const initialState: LoginState = {};

export function LoginForm({ nextPath }: Props) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <input type="hidden" name="next" value={nextPath} />
      <Input
        type="password"
        name="password"
        label="Password"
        placeholder="••••••••"
        autoComplete="current-password"
        autoFocus
        required
        variant="outline"
        error={state.error}
      />
      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={pending}
        className="w-full"
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
        Set <code className="font-mono">ADMIN_PANEL_PASSWORD</code> in{" "}
        <code className="font-mono">.env.local</code>.
      </p>
    </form>
  );
}
