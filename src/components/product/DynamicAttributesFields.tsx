/**
 * Renderiza dinamicamente os campos personalizados de uma vertical dentro de
 * um formulário de produto (ou lead). Grava/lê valores em `attributes` (objeto).
 */
import type { Category } from "@/types";
import { getVertical, type AttributeField } from "@/lib/verticals";

interface Props {
  category: Category;
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  /** Se true, usa os `leadFields` da vertical em vez dos atributos de produto. */
  mode?: "product" | "lead";
}

export default function DynamicAttributesFields({
  category,
  values,
  onChange,
  mode = "product",
}: Props) {
  const vertical = getVertical(category);
  if (!vertical) return null;
  const fields: AttributeField[] =
    mode === "lead" ? (vertical.leadFields ?? []) : vertical.attributes;
  if (fields.length === 0) return null;

  const setField = (key: string, value: unknown) => onChange({ ...values, [key]: value });

  return (
    <div className="space-y-3">
      {vertical.disclaimer && mode === "product" && (
        <div className="text-[11px] leading-relaxed bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3">
          <strong className="block mb-1">⚠️ Aviso de conformidade</strong>
          {vertical.disclaimer}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((f) => {
          const raw = values?.[f.key];
          const v: string | number = typeof raw === "number" ? raw : (raw as string | undefined) ?? "";
          const common =
            "w-full text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200";
          return (
            <label key={f.key} className="block text-xs">
              <span className="block font-semibold text-slate-600 mb-1">
                {f.label}
                {f.required && <span className="text-red-500 ml-0.5">*</span>}
              </span>
              {f.type === "textarea" ? (
                <textarea
                  className={common}
                  rows={3}
                  value={v}
                  onChange={(e) => setField(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              ) : f.type === "select" ? (
                <select
                  className={common}
                  value={v}
                  onChange={(e) => setField(f.key, e.target.value)}
                >
                  <option value="">Selecione…</option>
                  {f.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : f.type === "boolean" ? (
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-blue-700"
                  checked={!!v}
                  onChange={(e) => setField(f.key, e.target.checked)}
                />
              ) : f.type === "number" ? (
                <input
                  type="number"
                  className={common}
                  value={v}
                  onChange={(e) =>
                    setField(f.key, e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder={f.placeholder}
                />
              ) : (
                <input
                  type="text"
                  className={common}
                  value={v}
                  onChange={(e) => setField(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
