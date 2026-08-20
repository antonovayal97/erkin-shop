import Link from "next/link";

const footerLinks = {
  Магазин: [
    { href: "/catalog", label: "Каталог" },
    { href: "/categories", label: "Категории" },
    { href: "/search", label: "Поиск" },
  ],
  Покупки: [
    { href: "/wishlist", label: "Избранное" },
    { href: "/cart", label: "Корзина" },
  ],
};

export async function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold tracking-tight">
              ERKIN SHOP
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Якутский магазин полезных вещей. Быстрая доставка, лёгкий возврат.
            </p>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-3 text-sm font-semibold text-foreground">{section}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
