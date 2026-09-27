"use client";

import { AuthScreen } from "@/components/auth-screen";

export default function RegisterPage() {
  return (
    <AuthScreen
      title="Crear cuenta"
      lead="Tus documentos quedan separados de los de otras cuentas."
      submitLabel="Registrarme"
      endpoint="/auth/register"
      alternateHref="/login"
      alternateLabel="Ya tengo cuenta"
    />
  );
}
