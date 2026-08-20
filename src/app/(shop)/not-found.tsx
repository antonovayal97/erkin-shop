import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-lg px-4 py-24 text-center">
      <p className="mb-4 select-none text-9xl font-black text-muted/30">404</p>
      <h1 className="mb-3 text-3xl font-bold">Страница не найдена</h1>
      <p className="mb-8 text-muted-foreground">
        Запрашиваемая страница не существует или была перемещена.
      </p>
      <div className="flex justify-center gap-3">
        <ButtonLink href="/">На главную</ButtonLink>
        <ButtonLink variant="outline" href="/catalog">
          Каталог
        </ButtonLink>
      </div>
    </div>
  );
}
