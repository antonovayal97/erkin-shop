import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="container mx-auto max-w-lg px-4 py-16 text-center md:py-20">
      <Check className="mx-auto mb-6 h-12 w-12 text-green-400" strokeWidth={2.5} />

      <h1 className="mb-3 text-2xl font-bold md:text-3xl">Спасибо!</h1>

      {order && (
        <p className="mb-2 text-muted-foreground">
          Номер заказа:
          <br />
          <span className="font-semibold text-foreground">{order}</span>
        </p>
      )}

      <p className="mx-auto mb-8 max-w-md text-muted-foreground">
        Ваш заказ оформлен. Менеджер свяжется с вами для подтверждения.
      </p>

      <div className="flex justify-center">
        <ButtonLink href="/catalog" size="lg">
          Перейти в каталог
        </ButtonLink>
      </div>
    </div>
  );
}
