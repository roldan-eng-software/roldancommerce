"use client";

import ProfileForm from "./profile-form";

interface Props {
  userId: string;
}

export default function ProfileContent({ userId }: Props) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold">Complete seu cadastro</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Informe endereço e CPF para finalizar compras.
      </p>
      <div className="mt-6">
        <ProfileForm userId={userId} />
      </div>
    </main>
  );
}
