'use client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { PiggyBank } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Google</title>
    <path
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.62-4.88 1.62-4.41 0-7.99-3.59-7.99-7.99s3.58-7.99 7.99-7.99c2.45 0 4.1.98 5.42 2.21l2.5-2.5C18.1.99 15.47 0 12.48 0 5.61 0 0 5.61 0 12.5S5.61 25 12.48 25c3.27 0 5.8-1.09 7.74-3.03 2.03-2.03 2.54-5.02 2.54-8.39 0-.6-.05-1.18-.15-1.74h-10.1z"
      fill="currentColor"
    />
  </svg>
);

export default function LoginPage() {
  const auth = useAuth();

  const handleLogin = () => {
    if (auth) {
      initiateGoogleSignIn(auth);
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
          <GoogleIcon className="mr-2 h-5 w-5" />
          Entrar com Google
        </Button>
      </div>
    </div>
  );
}

    