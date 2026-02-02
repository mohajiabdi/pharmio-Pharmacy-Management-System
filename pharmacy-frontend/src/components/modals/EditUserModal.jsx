import React, { useEffect, useMemo, useState } from "react";
import { X, UserCheck, UserX } from "lucide-react";

const cx = (...a) => a.filter(Boolean).join(" ");

function Input(props) {
  return (
    <input
      {...props}
      className={cx(
        "h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-semibold",
        "text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--foreground))]/40",
        "outline-none focus:border-[hsl(var(--brand-strong))]",
        props.className,
      )}
    />
  );
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cx(
        "h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-extrabold",
        "text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--brand-strong))]",
      )}
    >
      {children}
    </select>
  );
}

export default function EditUserModal({
  open,
  user,
  meId, // ✅ pass from Settings: me?.id
  onClose,
  onSave, // ✅ should save profile changes (PATCH /api/users/:id)
  onSetActive, // ✅ should toggle active (PATCH /api/users/:id/active)
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("pharmacist");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setFullName(user?.full_name || "");
    setEmail(user?.email || "");
    setRole(user?.role || "pharmacist");
    setIsActive(!!user?.is_active);
  }, [user]);

  const isMe = useMemo(
    () => !!(meId && user?.id && meId === user.id),
    [meId, user?.id],
  );
  const isTargetAdmin = user?.role === "admin";

  // You said: admin cannot edit admins here (only inactive)
  // So: disable name/email/role when user is admin, but still allow active toggle (unless it's me).
  const canEditFields = !isTargetAdmin && !isMe;
  const canToggleActive = !isMe; // ✅ cannot deactivate yourself

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-[hsl(var(--overlay))]/60"
        onClick={onClose}
      />
      <div className="relative grid h-dvh place-items-center p-3 sm:p-4">
        <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
            <div>
              <div className="text-sm font-extrabold">Edit User</div>
              <div className="text-xs font-semibold text-[hsl(var(--foreground))]/60">
                {user?.email || ""}
              </div>
            </div>

            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl hover:bg-[hsl(var(--foreground))]/5"
              type="button"
            >
              <X className="h-4 w-4 text-[hsl(var(--foreground))]/70" />
            </button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 gap-3">
              {/* Full name */}
              <div>
                <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                  Full name
                </div>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!canEditFields}
                  className={
                    !canEditFields ? "opacity-60 cursor-not-allowed" : ""
                  }
                />
              </div>

              {/* Email */}
              <div>
                <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                  Email
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!canEditFields}
                  className={
                    !canEditFields ? "opacity-60 cursor-not-allowed" : ""
                  }
                />
              </div>

              {/* Role */}
              <div>
                <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[hsl(var(--foreground))]/60">
                  Role
                </div>

                <Select
                  value={role}
                  onChange={setRole}
                  disabled={!canEditFields}
                  className={
                    !canEditFields ? "opacity-60 cursor-not-allowed" : ""
                  }
                >
                  <option value="admin">admin</option>
                  <option value="pharmacist">pharmacist</option>
                  <option value="cashier">cashier</option>
                </Select>

                {isTargetAdmin ? (
                  <div className="mt-2 text-xs font-semibold text-[hsl(var(--foreground))]/55">
                    Admin users cannot be edited here (only Active/Inactive).
                  </div>
                ) : null}
              </div>

              {/* Active toggle */}
              <div className="mt-1 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold">Account Status</div>
                    <div className="text-xs font-semibold text-[hsl(var(--foreground))]/60">
                      Activate or deactivate this user
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!canToggleActive}
                    onClick={() => {
                      const next = !isActive;
                      setIsActive(next);
                      onSetActive?.(next);
                    }}
                    className={cx(
                      "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-extrabold",
                      !canToggleActive
                        ? "opacity-50 cursor-not-allowed border-[hsl(var(--border))]"
                        : "border-[hsl(var(--border))] hover:bg-[hsl(var(--foreground))]/5",
                    )}
                    title={!canToggleActive ? "You cannot change yourself" : ""}
                  >
                    {isActive ? (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Active
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4" />
                        Inactive
                      </>
                    )}
                  </button>
                </div>

                {!canToggleActive ? (
                  <div className="mt-2 text-xs font-semibold text-rose-300">
                    You cannot deactivate your own account.
                  </div>
                ) : null}
              </div>

              {/* Buttons */}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={onClose}
                  type="button"
                  className="h-11 w-full rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm font-extrabold hover:bg-[hsl(var(--foreground))]/5"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => onSave?.({ full_name: fullName, email, role })}
                  disabled={!canEditFields}
                  className={cx(
                    "h-11 w-full rounded-2xl px-4 text-sm font-extrabold",
                    canEditFields
                      ? "bg-[hsl(var(--brand-strong))] text-[hsl(var(--brand))] hover:opacity-90"
                      : "bg-[hsl(var(--foreground))]/10 text-[hsl(var(--foreground))]/50 cursor-not-allowed",
                  )}
                >
                  Save
                </button>
              </div>

              <div className="text-xs font-semibold text-[hsl(var(--foreground))]/55">
                Note: You cannot edit or deactivate yourself. Admin users are
                locked (only active/inactive).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
