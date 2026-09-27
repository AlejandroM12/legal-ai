"use client";

import { AuthScreen } from "@/components/auth-screen";

export default function LoginPage() {
  return (
    <AuthScreen
      title="Iniciar sesión"
      lead="Acceso privado a tus documentos."
      submitLabel="Entrar"
      endpoint="/auth/login"
      alternateHref="/register"
      alternateLabel="Crear cuenta"
    />
  );
}
