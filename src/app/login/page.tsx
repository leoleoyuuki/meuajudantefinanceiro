'use client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { PiggyBank } from 'lucide-react';

export default function LoginPage() {
  const auth = useAuth();

  const handleLogin = () => {
    if (auth) {
      initiateAnonymousSignIn(auth);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <PiggyBank className="size-16 text-primary" />
        <h1 className="font-headline text-3xl font-bold">
          Meu Ajudante Financeiro
        </h1>
        <p className="max-w-md text-muted-foreground">
          Tome o controle de suas finanças com nosso assistente inteligente.
        </p>
      </div>
      <div className="mt-8 w-full max-w-xs">
        <Button onClick={handleLogin} className="w-full" size="lg">
          Entrar como Anônimo
        </Button>
      </div>
    </div>
  );
}
