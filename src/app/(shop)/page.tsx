import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="animate-fade-in relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          Добро пожаловать в ERKIN SHOP
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
          Найдите нужные товары в нашем каталоге
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink size="lg" href="/catalog">
            Перейти в каталог
            <ArrowRight className="h-5 w-5" />
          </ButtonLink>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />
      </div>
    </div>
  );
}
