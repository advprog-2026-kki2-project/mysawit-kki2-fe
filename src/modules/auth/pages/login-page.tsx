import { AuthShell } from "@/modules/auth/components/auth-shell";
import { LoginForm } from "@/modules/auth/components/login-form";

export function LoginPage() {
  return (
    <AuthShell
      badge="Login"
      title="Masuk ke akun Anda."
      description="Gunakan email dan password yang sudah terdaftar."
      alternateHref="/register"
      alternateLabel="Buat akun"
      alternatePrompt="Belum punya akun? Buat akun baru untuk mulai masuk."
    >
      <LoginForm />
    </AuthShell>
  );
}
