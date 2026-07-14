import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CreateAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
});

export const createAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw) => CreateAdminSchema.parse(raw))
  .handler(async ({ data, context }) => {
    // 1. Verificar que o chamador é admin
    const { data: ownAdminRole, error: roleErr } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) throw new Error("Falha ao verificar permissão.");
    if (!ownAdminRole) throw new Error("Apenas administradores podem criar novos administradores.");

    // 2. Criar usuário via Admin API + atribuir role admin
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, role: "admin" },
    });

    if (createErr || !created?.user) {
      throw new Error(createErr?.message || "Falha ao criar usuário.");
    }

    // Garantir role admin (o trigger normalmente já cria como visitor a menos que seja contato@midiaeco.com)
    const { error: grantErr } = await supabaseAdmin.rpc("admin_set_user_role", {
      _target_user: created.user.id,
      _role: "admin",
      _grant: true,
    });
    if (grantErr) {
      // Se falhar, remover usuário criado para manter consistência
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error(grantErr.message);
    }

    return { userId: created.user.id, email: created.user.email };
  });
