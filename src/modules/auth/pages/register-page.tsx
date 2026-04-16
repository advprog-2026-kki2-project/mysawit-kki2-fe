import { AuthShell } from "@/modules/auth/components/auth-shell";
import { RegisterForm } from "@/modules/auth/components/register-form";

export function RegisterPage() {
  return (
    <AuthShell
      badge="Register"
      title="Buat akun baru."
      description="Pendaftaran mandiri tersedia untuk pekerja, mandor, dan sopir."
      alternateHref="/login"
      alternateLabel="Masuk"
      alternatePrompt="Sudah punya akun? Masuk dengan email dan password Anda."
    >
      <RegisterForm />
    </AuthShell>
  );
}
