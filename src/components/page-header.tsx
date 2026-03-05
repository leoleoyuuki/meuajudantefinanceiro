type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="hidden items-center justify-between md:flex">
      <h1 className="font-headline text-3xl font-bold text-foreground">
        {title}
      </h1>
      {children}
    </div>
  );
}
