import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useAuth, signOut } from "@/hooks/useAuth";

export default function AuthBar() {
  const { user, roles, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <Link
        to="/auth"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition"
      >
        <LogIn className="w-3.5 h-3.5" />
        Entrar / Criar conta
      </Link>
    );
  }

  const displayName =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    user.email?.split("@")[0] ||
    "Usuário";

  return (
    <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-lg px-2 py-1">
      <div className="flex items-center gap-1.5 text-white text-xs">
        <UserIcon className="w-3.5 h-3.5 text-green-400" />
        <span className="font-medium truncate max-w-[120px]">{displayName}</span>
        {roles[0] && (
          <span className="ml-1 text-[10px] uppercase tracking-wide bg-green-600/20 text-green-300 px-1.5 py-0.5 rounded font-mono">
            {roles[0]}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => void signOut()}
        title="Sair"
        className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
