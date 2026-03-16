'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore, useFirebase } from '@/firebase';
import {
  signUpWithEmail,
  signInWithEmail,
} from '@/firebase/auth/actions';
import { initiateGoogleSignIn } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PiggyBank, Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';


const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z
    .string()
    .min(1, { message: 'A senha não pode estar em branco.' }),
});

const signUpSchema = z
  .object({
    name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
    whatsapp: z.string().min(10, { message: 'Por favor, insira um WhatsApp válido.' }),
    email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
    password: z
      .string()
      .min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não correspondem.',
    path: ['confirmPassword'],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

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
  const [isLoading, setIsLoading] = useState(false);
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', whatsapp: '', email: '', password: '', confirmPassword: '' },
  });

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setIsLoading(true);

    if (Capacitor.getPlatform() === 'web') {
      initiateGoogleSignIn(auth);
      // For web, loading state might be handled differently post-redirect
      setIsLoading(false); 
    } else {
      // Native platform flow
      try {
        const result = await FirebaseAuthentication.signInWithGoogle();
        if (result.credential?.idToken) {
            const credential = GoogleAuthProvider.credential(result.credential.idToken);
            await signInWithCredential(auth, credential);
            // AuthWrapper will handle redirection
        } else {
            throw new Error("O login nativo com Google não retornou um token.");
        }
      } catch (error) {
        console.error('Erro no login nativo com Google:', error);
        toast({
          variant: 'destructive',
          title: 'Erro no login',
          description: 'Não foi possível fazer login com o Google no momento.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onLoginSubmit = async (data: LoginFormValues) => {
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmail(auth, data);
      // O redirecionamento será tratado pelo AuthWrapper
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro no login',
        description: 'E-mail ou senha inválidos. Por favor, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignUpSubmit = async (data: SignUpFormValues) => {
    if (!auth || !firestore) return;
    setIsLoading(true);
    try {
      await signUpWithEmail(auth, firestore, data);
      // O redirecionamento será tratado pelo AuthWrapper
    } catch (error: any) {
      let description = 'Ocorreu um erro ao criar sua conta. Tente novamente.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'Este e-mail já está em uso por outra conta.';
      }
      toast({
        variant: 'destructive',
        title: 'Erro no cadastro',
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
            <PiggyBank className="size-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">
            Meu Ajudante Financeiro
          </CardTitle>
          <CardDescription>
            Acesse sua conta ou crie uma nova para começar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="pt-4">
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="seu@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Sua senha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Entrar
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="signup" className="pt-4">
              <Form {...signUpForm}>
                <form
                  onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={signUpForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="seu@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={signUpForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Repita sua senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Criar conta
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <Separator />
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
              <span className="bg-card px-2 text-xs uppercase text-muted-foreground">
                ou
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full"
            disabled={isLoading}
          >
            <GoogleIcon className="mr-2 h-5 w-5" />
            Continue com o Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
