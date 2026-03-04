type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="font-headline text-3xl font-bold text-foreground">
        {title}
      </h1>
      {children}
    </div>
  );
}
