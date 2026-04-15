import { AuthShell } from "@/modules/auth/components/auth-shell";
import { RegisterForm } from "@/modules/auth/components/register-form";

export function RegisterPage() {
  return (
    <AuthShell
      badge="Register Frontend"
      title="Buat akun baru tanpa meninggalkan aplikasi frontend."
      description="Registrasi sekarang berada di frontend agar alur pengguna konsisten dengan arsitektur FE/BE yang terpisah. Backend tetap fokus di kontrak API, validasi, dan session management."
      alternateHref="/login"
      alternateLabel="Masuk"
      alternatePrompt="Sudah punya akun? Langsung masuk lewat halaman login frontend dan gunakan sesi backend yang sama."
    >
      <RegisterForm />
    </AuthShell>
  );
}
