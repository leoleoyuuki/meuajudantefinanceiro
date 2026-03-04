import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import placeholderImages from '@/lib/placeholder-images.json';

export function DashboardHeader() {
  const userImage = placeholderImages.find((p) => p.id === 'user-avatar');

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-base text-muted-foreground">Bem-vindo(a) de volta,</p>
        <h1 className="font-headline text-2xl font-bold text-foreground">
          Usuário
        </h1>
      </div>
      <Avatar className="size-12 border-2 border-primary/20">
        <AvatarImage
          src={userImage?.src}
          alt="User Avatar"
          data-ai-hint={userImage?.hint}
        />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </div>
  );
}
