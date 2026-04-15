import { AuthShell } from "@/modules/auth/components/auth-shell";
import { LoginForm } from "@/modules/auth/components/login-form";

export function LoginPage() {
  return (
    <AuthShell
      badge="Login Frontend"
      title="Masuk ke MySawit dari antarmuka frontend."
      description="Halaman ini menggantikan login server-rendered. Semua interaksi auth dilakukan lewat API backend yang sama, sehingga UI dan integrasi sekarang benar-benar berada di frontend."
      alternateHref="/register"
      alternateLabel="Buat akun"
      alternatePrompt="Belum punya akun? Mulai registrasi dari frontend dan lanjutkan ke flow login yang sama."
    >
      <LoginForm />
    </AuthShell>
  );
}
