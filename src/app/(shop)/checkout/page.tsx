"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { ChevronDown, ShoppingBag } from "lucide-react";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

const INITIAL_FORM: FormData = {
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
};

/** Маска: +7 (999) 999-99-99 */
function formatPhoneMask(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }
  if (!digits.startsWith("7")) {
    digits = `7${digits}`;
  }
  digits = digits.slice(0, 11);

  const local = digits.slice(1);
  let result = "+7";

  if (local.length === 0) return result;

  result += ` (${local.slice(0, 3)}`;
  if (local.length < 3) return result;

  result += ")";
  if (local.length === 3) return result;

  result += ` ${local.slice(3, 6)}`;
  if (local.length <= 6) return result;

  result += `-${local.slice(6, 8)}`;
  if (local.length <= 8) return result;

  result += `-${local.slice(8, 10)}`;
  return result;
}

function isPhoneComplete(phone: string): boolean {
  return phone.replace(/\D/g, "").length === 11;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const total = getTotal();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0 && !orderCompleted && !isPending) {
      router.replace("/cart");
    }
  }, [mounted, items.length, orderCompleted, isPending, router]);

  if (!mounted || (items.length === 0 && !orderCompleted)) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12 text-center text-sm text-muted-foreground">
        Загрузка…
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "phone" ? formatPhoneMask(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPhoneComplete(form.phone)) {
      setError("Введите номер телефона полностью: +7 (999) 999-99-99");
      return;
    }

    startTransition(async () => {
      try {
        const orderData = {
          phone: form.phone,
          email: form.phone,
          items: items.map((item) => ({
            product: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            variantName: item.variantName,
            variantValue: item.variantValue,
          })),
          shippingAddress: {
            firstName: form.firstName,
            lastName: form.lastName,
            address: form.address,
            city: "Якутск",
            state: "Республика Саха (Якутия)",
            postalCode: "677000",
            country: "Россия",
          },
          subtotal: total,
          shipping: 0,
          total,
          paymentStatus: "unpaid",
        };

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          const message =
            payload?.errors?.[0]?.message ??
            "Ошибка при оформлении заказа. Попробуйте снова.";
          setError(message);
          return;
        }

        const data = await res.json();
        const orderNumber = data?.doc?.orderNumber ?? data?.orderNumber;

        setOrderCompleted(true);
        router.replace(
          orderNumber
            ? `/checkout/success?order=${encodeURIComponent(orderNumber)}`
            : "/checkout/success",
        );
        clearCart();
      } catch {
        setError("Ошибка соединения. Попробуйте снова.");
      }
    });
  };

  const orderItems = (
    <div className="max-h-52 space-y-3 overflow-y-auto scrollbar-none lg:max-h-64">
      {items.map((item) => (
        <div
          key={`${item.productId}-${item.variantValue}`}
          className="flex items-center gap-3"
        >
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-muted-foreground opacity-40" />
              </div>
            )}
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
              {item.quantity}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
            {item.variantValue && (
              <p className="text-xs text-muted-foreground">{item.variantValue}</p>
            )}
          </div>
          <p className="shrink-0 text-sm font-bold">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      ))}
    </div>
  );

  const orderTotals = (
    <div className="space-y-2 border-t border-border pt-4 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Товары</span>
        <span>{formatPrice(total)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Доставка</span>
        <span className="text-green-400">Бесплатно</span>
      </div>
      <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
        <span>Итого</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-4 pb-28 md:py-8 md:pb-8">
      <h1 className="mb-4 text-xl font-bold tracking-tight md:mb-8 md:text-2xl">
        Оформление заказа
      </h1>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-8">
        {/* Mobile order summary */}
        <div className="rounded-xl border border-border bg-card lg:hidden">
          <button
            type="button"
            onClick={() => setSummaryOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <div>
              <p className="text-sm font-semibold">Ваш заказ</p>
              <p className="text-xs text-muted-foreground">
                {items.length}{" "}
                {items.length === 1 ? "товар" : items.length < 5 ? "товара" : "товаров"} ·{" "}
                {formatPrice(total)}
              </p>
            </div>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                summaryOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {summaryOpen && (
            <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
              {orderItems}
              {orderTotals}
            </div>
          )}
        </div>

        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="space-y-3 rounded-xl border border-border bg-card p-4 md:space-y-4 md:p-6">
            <h2 className="text-base font-semibold md:text-lg">Контактные данные</h2>
            <Input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              label="Мобильный телефон"
              placeholder="+7 (999) 999-99-99"
              value={form.phone}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                name="firstName"
                label="Имя"
                placeholder="Иван"
                autoComplete="given-name"
                value={form.firstName}
                onChange={handleChange}
                required
              />
              <Input
                name="lastName"
                label="Фамилия"
                placeholder="Иванов"
                autoComplete="family-name"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-card p-4 md:space-y-4 md:p-6">
            <h2 className="text-base font-semibold md:text-lg">Адрес доставки</h2>
            <p className="text-sm text-muted-foreground">
              Доставка осуществляется только по городу Якутск
            </p>
            <Input
              name="address"
              label="Улица, дом, квартира"
              placeholder="ул. Ленина, д. 1, кв. 10"
              autoComplete="street-address"
              value={form.address}
              onChange={handleChange}
              required
            />
            <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm text-muted-foreground">
              Город: <span className="font-medium text-foreground">Якутск</span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="hidden w-full lg:inline-flex"
            isLoading={isPending}
          >
            Подтвердить заказ {formatPrice(total)}
          </Button>
        </form>

        {/* Desktop order summary */}
        <div className="hidden lg:block">
          <div className="sticky top-24 space-y-4 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Ваш заказ</h2>
            {orderItems}
            {orderTotals}
          </div>
        </div>
      </div>

      {/* Mobile sticky submit */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Итого</span>
          <span className="text-base font-bold">{formatPrice(total)}</span>
        </div>
        <Button
          type="submit"
          form="checkout-form"
          size="lg"
          className="w-full"
          isLoading={isPending}
        >
          Подтвердить заказ
        </Button>
      </div>
    </div>
  );
}
