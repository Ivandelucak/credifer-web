//src/app/page.tsx
import Link from "next/link";
import { siteConfig } from "@/lib/site";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductHorizontalScroller } from "@/components/products/ProductHorizontalScroller";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const featuredCategories = [
  {
    name: "Celulares",
    href: "/celulares",
    description: "Equipos para todos los días, con consulta de financiación.",
    image: "/home/categorias/categoria-celulares.webp",
  },
  {
    name: "Electrodomésticos",
    href: "/electrodomesticos",
    description: "Productos para equipar tu casa con atención personalizada.",
    image: "/home/categorias/categoria-electrodomesticos.webp",
  },
  {
    name: "Parlantes",
    href: "/parlantes",
    description: "Audio, música y entretenimiento para disfrutar más.",
    image: "/home/categorias/categoria-parlantes.webp",
  },
  {
    name: "Herramientas",
    href: "/herramientas",
    description: "Artículos prácticos para el trabajo, el hogar o tu comercio.",
    image: "/home/categorias/categoria-herramientas.webp",
  },
];

const heroBenefits = [
  {
    label: "Financiación",
    value: "Cuota semanal y Cuota Simple",
    accent: "bg-[var(--brand-yellow)]",
  },
  {
    label: "Pagos",
    value: "Tarjetas, efectivo o transferencia",
    accent: "bg-[var(--brand-green)]",
  },
  {
    label: "Atención",
    value: "Asesoramiento personalizado",
    accent: "bg-[var(--brand-red)]",
  },
];

const mobileHeroChips = [
  {
    label: "Cuotas",
    value: "Financiación",
  },
  {
    label: "Stock",
    value: "Consulta",
  },
  {
    label: "Entrega",
    value: "Coordinada",
  },
];

const financingBenefits = [
  {
    title: "Cuota semanal",
    text: "Consultá alternativas de pago semanal para organizar tu compra de manera simple.",
    badge: "Semanal",
    accent: "bg-[var(--brand-yellow)] text-[var(--brand-blue-dark)]",
  },
  {
    title: "Cuota Simple 3 y 6",
    text: "Opciones de cuotas simples disponibles según producto y condiciones vigentes.",
    badge: "3 y 6",
    accent: "bg-[var(--brand-green)] text-white",
  },
  {
    title: "Tarjetas",
    text: "Trabajamos con tarjetas de crédito y débito para coordinar tu compra.",
    badge: "Crédito / Débito",
    accent: "bg-[var(--brand-blue)] text-white",
  },
  {
    title: "Efectivo y transferencia",
    text: "También podés consultar pago en efectivo o transferencia bancaria.",
    badge: "Flexible",
    accent: "bg-[var(--brand-red)] text-white",
  },
];

const steps = [
  {
    number: "01",
    title: "Explorá el catálogo",
    text: "Buscá productos por categoría, revisá precios publicados y armá tu selección.",
  },
  {
    number: "02",
    title: "Agregá al carrito",
    text: "Guardá los productos que querés consultar para enviar todo junto.",
  },
  {
    number: "03",
    title: "Consultá financiación",
    text: "Un asesor confirma cuotas, formas de pago, disponibilidad y entrega.",
  },
];

const paymentMethods = [
  {
    name: "Contado efectivo",
    image: "/home/pagos/contado-efectivo.png",
  },
  {
    name: "Crédito / Débito",
    image: "/home/pagos/credito-debito.png",
  },
  {
    name: "Transferencia bancaria",
    image: "/home/pagos/transferencia-bancaria.png",
  },
  {
    name: "Cuota semanal",
    image: "/home/pagos/cuota-semanal.png",
  },
  {
    name: "Cuota Simple 3 y 6",
    image: "/home/pagos/cuota-simple.png",
  },
];

const purchaseReasons = [
  {
    title: "Renovar tu casa",
    text: "Electrodomésticos, climatización, tecnología y artículos útiles para el hogar.",
    image: "/home/soluciones/solucion-renovar-casa.webp",
  },
  {
    title: "Equipar tu comercio",
    text: "Productos prácticos para trabajar, atender mejor y renovar tu negocio.",
    image: "/home/soluciones/solucion-equipar-comercio.webp",
  },
  {
    title: "Trabajar mejor",
    text: "Herramientas, celulares, audio, movilidad y soluciones para el día a día.",
    image: "/home/soluciones/solucion-trabajar-mejor.webp",
  },
];

const serviceAreas = [
  {
    title: "Base El Pato / Berazategui",
    description:
      "Zonas cercanas a nuestra base principal, con coordinación habitual según producto y disponibilidad.",
    areas: [
      "El Pato",
      "Ing. Juan Allan",
      "Juan María Gutiérrez",
      "Pereyra",
      "Plátanos",
      "Hudson",
      "Ranelagh",
      "Sourigues",
      "Barrio Marítimo",
      "Berazategui",
      "Villa España",
    ],
    accent: "bg-[var(--brand-blue)]",
  },
  {
    title: "Base La Plata",
    description:
      "También coordinamos consultas y operaciones desde la zona de La Plata y alrededores cercanos.",
    areas: [
      "La Plata",
      "Villa Elisa",
      "City Bell",
      "Gonnet",
      "Gorina",
      "Arturo Seguí",
      "El Peligro",
    ],
    accent: "bg-[var(--brand-green)]",
  },
  {
    title: "Zonas a consultar",
    description:
      "Algunas localidades se evalúan según recorrido, producto, disponibilidad y coordinación.",
    areas: [
      "Abasto",
      "Ángel Etcheverry",
      "Brandsen",
      "Tolosa",
      "Ringuelet",
      "Villa Castells",
      "El Rincón",
      "José Hernández",
      "Otras zonas cercanas",
    ],
    accent: "bg-[var(--brand-yellow)]",
  },
];

export default async function HomePage() {
  const productCardSelect = {
    id: true,
    name: true,
    slug: true,
    price: true,
    descriptionShort: true,
    isFeatured: true,
    isOffer: true,
    category: {
      select: {
        name: true,
        slug: true,
      },
    },
    subcategory: {
      select: {
        name: true,
        slug: true,
      },
    },
    brand: {
      select: {
        name: true,
      },
    },
    images: {
      orderBy: [{ isPrimary: "desc" as const }, { position: "asc" as const }],
      take: 1,
      select: {
        url: true,
        alt: true,
      },
    },
  };

  const [offerProducts, featuredProducts] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        isOffer: true,
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 10,
      select: productCardSelect,
    }),

    prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        isFeatured: true,
        isOffer: false,
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 10,
      select: productCardSelect,
    }),
  ]);

  const serializedOfferProducts = offerProducts.map((product) => ({
    ...product,
    price: product.price ? product.price.toString() : null,
  }));

  const serializedFeaturedProducts = featuredProducts.map((product) => ({
    ...product,
    price: product.price ? product.price.toString() : null,
  }));

  const commerceWhatsappUrl = `https://wa.me/${
    siteConfig.whatsappNumber
  }?text=${encodeURIComponent(
    "Hola Credifer, tengo un comercio y quiero solicitar asesoramiento sobre productos, financiación y pagos semanales.",
  )}`;

  return (
    <main className="bg-[var(--catalog-bg)]">
      <section className="relative overflow-hidden border-b-2 border-[#B7CADA] bg-[linear-gradient(135deg,#EAF4FB_0%,#F8FBFF_40%,#FFF7D8_72%,#EAF8EF_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,rgba(2,100,169,0.20),transparent_32%),radial-gradient(circle_at_84%_12%,rgba(123,170,53,0.16),transparent_28%),radial-gradient(circle_at_62%_86%,rgba(244,196,48,0.24),transparent_30%),radial-gradient(circle_at_36%_78%,rgba(216,33,40,0.08),transparent_24%)]" />

        <div className="pointer-events-none absolute inset-0 opacity-[0.10] [background-image:linear-gradient(rgba(2,100,169,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(2,100,169,0.14)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[40%] top-[52%] hidden h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-[0.09] lg:block">
            <Image
              src="/brand/logo-square.png"
              alt=""
              fill
              aria-hidden="true"
              sizes="520px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="container-page relative grid items-center gap-8 py-10 sm:py-14 lg:min-h-[640px] lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:py-16">
          <div>
            <div className="mb-6 inline-flex w-fit items-center gap-3 rounded-[1.35rem] border border-[#B7CADA] bg-white/90 px-4 py-3 shadow-[0_12px_26px_rgba(15,23,42,0.10)] backdrop-blur">
              <div className="relative h-11 w-24 shrink-0 sm:h-12 sm:w-28">
                <Image
                  src="/brand/logo-credifer.png"
                  alt="Credifer"
                  fill
                  priority
                  sizes="112px"
                  className="object-contain object-left"
                />
              </div>

              <div className="hidden border-l border-[#C9D6E4] pl-3 sm:block">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--brand-blue)]">
                  Catálogo online
                </p>
                <p className="mt-0.5 text-xs font-extrabold leading-4 text-[var(--brand-blue-dark)]">
                  Productos y financiación
                </p>
              </div>
            </div>

            <h1 className="max-w-3xl text-[2.45rem] font-black leading-[0.96] tracking-[-0.05em] text-[var(--text-primary)] sm:text-5xl sm:leading-[1.02] lg:text-6xl">
              Todo para tu casa, tu trabajo y tu día a día.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
              Elegí productos del catálogo Credifer y consultá cuotas,
              financiación, disponibilidad y entrega con atención personalizada.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2 lg:hidden">
              {mobileHeroChips.map((chip) => (
                <div
                  key={chip.label}
                  className="rounded-2xl border border-[#C9D6E4] bg-white/82 px-2.5 py-2.5 text-center shadow-[0_10px_24px_rgba(15,23,42,0.07)] backdrop-blur"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--brand-blue)]">
                    {chip.label}
                  </p>
                  <p className="mt-0.5 text-[11px] font-black leading-4 text-[var(--brand-blue-dark)]">
                    {chip.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/productos"
                className="inline-flex justify-center rounded-2xl bg-[var(--brand-blue)] px-6 py-3.5 text-sm font-black text-white shadow-[0_16px_34px_rgba(2,100,169,0.28)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-blue-dark)] focus-ring"
              >
                Ver catálogo
              </Link>

              <Link
                href="/como-comprar"
                className="inline-flex justify-center rounded-2xl border border-[#B7CADA] bg-white/88 px-6 py-3.5 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
              >
                Cómo comprar
              </Link>
            </div>

            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[250px] z-[1] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 opacity-[0.16] mix-blend-multiply lg:hidden"
            >
              <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(244,196,48,0.16)] blur-3xl" />

              <div className="relative h-full w-full">
                <Image
                  src="/brand/logo-credifer.png"
                  alt=""
                  fill
                  sizes="360px"
                  className="object-contain"
                />
              </div>
            </div>

            <div className="mt-8 hidden gap-3 sm:grid sm:grid-cols-3">
              {heroBenefits.map((benefit) => (
                <div
                  key={benefit.label}
                  className="group rounded-2xl border border-[#C9D6E4] bg-white/88 p-4 shadow-[0_10px_26px_rgba(15,23,42,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:shadow-[0_16px_34px_rgba(15,23,42,0.12)]"
                >
                  <span
                    className={`mb-4 block h-1.5 w-12 rounded-full ${benefit.accent}`}
                  />

                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                    {benefit.label}
                  </p>

                  <p className="mt-2 text-sm font-extrabold leading-5 text-[var(--text-primary)]">
                    {benefit.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-[rgba(216,33,40,0.14)] blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 right-4 h-44 w-44 rounded-full bg-[rgba(2,100,169,0.22)] blur-3xl" />

            <div className="relative rounded-[2.4rem] border border-[#AEC7DA] bg-white/82 p-4 shadow-[0_30px_75px_rgba(15,23,42,0.18)] backdrop-blur">
              <div className="relative overflow-hidden rounded-[2rem] bg-[var(--brand-blue-dark)]">
                <div className="relative">
                  <div className="relative h-[320px] overflow-hidden sm:h-[470px]">
                    <Image
                      src="/home/hero-productos-credifer.webp"
                      alt="Productos del catálogo Credifer"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 560px"
                      className="object-cover object-center"
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,53,88,0.90)_0%,rgba(11,53,88,0.52)_42%,rgba(11,53,88,0.10)_100%)]" />

                    <div className="absolute left-5 top-5 hidden max-w-[290px] rounded-3xl border border-white/12 bg-white/12 p-5 text-white backdrop-blur-md sm:block">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">
                        Beneficios Credifer
                      </p>

                      <h2 className="mt-3 text-2xl font-black leading-tight tracking-[-0.03em]">
                        Elegí productos y consultá opciones de financiación.
                      </h2>

                      <p className="mt-3 text-sm leading-6 text-white/76">
                        Cuotas, medios de pago y entrega se coordinan con
                        atención personalizada.
                      </p>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 hidden gap-3 sm:grid sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/12 bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.16)]">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--brand-blue)]">
                          Cuota semanal
                        </p>
                        <p className="mt-1 text-sm font-black text-[var(--text-primary)]">
                          Consultá opciones disponibles
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/12 bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.16)]">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--brand-green)]">
                          Cuota Simple
                        </p>
                        <p className="mt-1 text-sm font-black text-[var(--text-primary)]">
                          3 y 6 según condiciones
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 bg-[var(--brand-blue-dark)] p-4 text-white sm:hidden">
                    <div className="rounded-2xl border border-white/12 bg-white/10 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/60">
                        Beneficios Credifer
                      </p>

                      <h2 className="mt-2 text-xl font-black leading-tight">
                        Elegí productos y consultá financiación.
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-white/72">
                        Cuotas, medios de pago y entrega se coordinan con
                        atención personalizada.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4 text-[var(--text-primary)]">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--brand-blue)]">
                        Cuota semanal
                      </p>
                      <p className="mt-1 text-sm font-black">
                        Consultá opciones disponibles
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4 text-[var(--text-primary)]">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--brand-green)]">
                        Cuota Simple
                      </p>
                      <p className="mt-1 text-sm font-black">
                        3 y 6 según condiciones
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white px-5 py-4 text-[var(--text-primary)]">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#C9D6E4] bg-[var(--catalog-surface-soft)] px-3 py-2 text-xs font-black text-[var(--brand-blue-dark)]">
                      <span className="h-2 w-2 rounded-full bg-[var(--brand-blue)]" />
                      Catálogo simple
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full border border-[#C9D6E4] bg-[var(--catalog-surface-soft)] px-3 py-2 text-xs font-black text-[var(--brand-blue-dark)]">
                      <span className="h-2 w-2 rounded-full bg-[var(--brand-yellow)]" />
                      Opciones de pago
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full border border-[#C9D6E4] bg-[var(--catalog-surface-soft)] px-3 py-2 text-xs font-black text-[var(--brand-blue-dark)]">
                      <span className="h-2 w-2 rounded-full bg-[var(--brand-green)]" />
                      Entrega coordinada
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:hidden">
            {heroBenefits.map((benefit, index) => {
              const accentClasses = [
                "bg-[var(--brand-yellow)]",
                "bg-[var(--brand-green)]",
                "bg-[var(--brand-red)]",
              ];

              return (
                <div
                  key={benefit.label}
                  className="rounded-2xl border border-[#C9D6E4] bg-white/90 p-4 shadow-[0_10px_26px_rgba(15,23,42,0.08)] backdrop-blur"
                >
                  <span
                    className={`mb-4 block h-1.5 w-12 rounded-full ${
                      accentClasses[index] ?? "bg-[var(--brand-blue)]"
                    }`}
                  />

                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                    {benefit.label}
                  </p>

                  <p className="mt-2 text-sm font-extrabold leading-5 text-[var(--text-primary)]">
                    {benefit.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ProductHorizontalScroller
        scrollId="home-offer-products"
        eyebrow="Ofertas"
        title="Ofertas destacadas"
        description="Productos seleccionados con precio contado publicado para consultar disponibilidad, cuotas y entrega."
        href="/productos?estado=ofertas"
        hrefLabel="Ver ofertas"
        products={serializedOfferProducts}
      />

      <section className="container-page pt-5 pb-5 lg:pt-6 lg:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
              Secciones
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
              Categorías destacadas
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
              Encontrá rápido los productos más buscados y entrá directo a cada
              sección del catálogo.
            </p>
          </div>

          <Link
            href="/categorias"
            className="rounded-md text-sm font-black text-[var(--brand-blue)] transition hover:text-[var(--brand-blue-dark)] focus-ring"
          >
            Ver todas las categorías
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredCategories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group rounded-3xl border border-[#C9D6E4] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[var(--brand-blue)] hover:shadow-[var(--shadow-card)] focus-ring"
            >
              <div className="relative mb-6 h-36 overflow-hidden rounded-2xl border border-[#C9D6E4] bg-[var(--brand-blue-soft)]">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(11,53,88,0.38)_100%)]" />
              </div>

              <h3 className="text-lg font-black text-[var(--text-primary)]">
                {category.name}
              </h3>

              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                {category.description}
              </p>

              <p className="mt-6 text-sm font-black text-[var(--brand-blue)]">
                Entrar a la sección →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[var(--catalog-bg)] pt-5 pb-10 lg:pt-6 lg:pb-12">
        <div className="container-page rounded-[2rem] border border-[#BDD0E0] bg-[var(--catalog-surface)] p-5 shadow-[0_14px_32px_rgba(15,23,42,0.06)] lg:p-6">
          <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                Beneficios
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
                Financiación y formas de pago para elegir mejor.
              </h2>
              <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
                En Credifer podés consultar financiación, cuotas y formas de
                pago disponibles para elegir la alternativa que mejor se adapte
                a tu compra.
              </p>

              <div className="mt-5 rounded-2xl border border-[#C9D6E4] bg-[var(--brand-blue-soft)] p-4">
                <p className="text-sm font-black text-[var(--brand-blue-dark)]">
                  Trabajamos con tarjetas de crédito y débito, efectivo y
                  transferencia bancaria.
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                  Las opciones de financiación se confirman según producto,
                  disponibilidad y condiciones vigentes.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {financingBenefits.map((item) => (
                <article
                  key={item.title}
                  className="group relative overflow-hidden rounded-[1.6rem] border border-[#C9D6E4] bg-[#FBFDFF] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[rgba(2,100,169,0.08)] blur-2xl transition group-hover:bg-[rgba(2,100,169,0.14)]" />

                  <div className="relative">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em] shadow-sm ${item.accent}`}
                    >
                      {item.badge}
                    </span>

                    <h3 className="mt-5 text-lg font-black text-[var(--text-primary)]">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                      {item.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProductHorizontalScroller
        scrollId="home-featured-products"
        eyebrow="Destacados"
        title="Productos destacados"
        description="Una selección de productos recomendados para encontrar rápido opciones útiles del catálogo Credifer."
        href="/productos?estado=destacados"
        hrefLabel="Ver destacados"
        products={serializedFeaturedProducts}
      />

      <section className="bg-[var(--catalog-bg)] pt-4 pb-8 lg:pt-5 lg:pb-9">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-[#BDD0E0] bg-[var(--catalog-surface)] p-6 shadow-[0_24px_56px_rgba(15,23,42,0.10)] lg:p-9">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(2,100,169,0.07),transparent_28%),radial-gradient(circle_at_88%_78%,rgba(37,211,102,0.05),transparent_24%)]" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_0.92fr] lg:items-stretch">
              <div className="flex flex-col">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                  Cómo comprar
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
                  Elegí, consultá y coordiná tu compra.
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
                  El proceso está pensado para que puedas ver productos, ordenar
                  tu consulta y recibir atención personalizada antes de cerrar
                  la operación.
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {steps.map((step) => (
                    <article
                      key={step.number}
                      className="rounded-[1.8rem] border border-[#C6D6E4] bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(15,23,42,0.12)]"
                    >
                      <p className="text-sm font-black text-[var(--brand-red)]">
                        {step.number}
                      </p>

                      <h3 className="mt-4 text-lg font-black text-[var(--text-primary)]">
                        {step.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                        {step.text}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="mt-6 rounded-[1.8rem] border border-[#C6D6E4] bg-[linear-gradient(135deg,#FFFFFF_0%,#EEF6FC_100%)] p-5 shadow-sm">
                  <p className="text-sm font-black text-[var(--brand-blue-dark)]">
                    No cerrás la compra a ciegas.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    Antes de confirmar, Credifer valida disponibilidad,
                    financiación, forma de pago y entrega para que tengas una
                    respuesta clara.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--brand-blue)] shadow-sm">
                      Atención personalizada
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--brand-blue)] shadow-sm">
                      Entrega coordinada
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--brand-blue)] shadow-sm">
                      Cuotas a consultar
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#0E517F] bg-[linear-gradient(160deg,#0B3558_0%,#0D4A73_100%)] p-5 text-white shadow-[0_22px_48px_rgba(8,47,73,0.24)] lg:p-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/65">
                  Formas de pago y financiación
                </p>

                <h3 className="mt-3 text-2xl font-black leading-tight">
                  Coordiná tu compra como te quede cómodo.
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/74">
                  Tarjetas, efectivo, transferencia y opciones de financiación
                  según producto.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.name}
                      className={`rounded-2xl border border-white/10 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(15,23,42,0.14)] ${
                        [
                          "Transferencia bancaria",
                          "Cuota semanal",
                          "Cuota Simple 3 y 6",
                        ].includes(method.name)
                          ? "sm:col-span-2"
                          : ""
                      }`}
                    >
                      <div className="relative h-10 w-full">
                        <Image
                          src={method.image}
                          alt={method.name}
                          fill
                          sizes="180px"
                          className="object-contain object-left"
                        />
                      </div>

                      <p className="mt-3 text-sm font-black leading-5 text-[var(--brand-blue-dark)]">
                        {method.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--catalog-bg)] pt-4 pb-8 lg:pt-5 lg:pb-10">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-[#BDD0E0] bg-[linear-gradient(135deg,#E7F3FF_0%,#F4FAFF_38%,#F8FBFE_72%,#EEF7F3_100%)] p-5 shadow-[0_18px_42px_rgba(15,23,42,0.08)] lg:p-7">
            <div className="pointer-events-none absolute -right-12 -top-12 h-[430px] w-[430px] rounded-full bg-[rgba(2,100,169,0.24)] blur-[110px]" />
            <div className="pointer-events-none absolute -bottom-16 left-6 h-[390px] w-[390px] rounded-full bg-[rgba(244,196,48,0.08)] blur-[110px]" />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-[-70px] top-[-30px] hidden h-[330px] w-[330px] opacity-[0.065] mix-blend-multiply lg:block"
            >
              <img
                src="/brand/logo-credifer.png"
                alt=""
                className="h-full w-full object-contain"
              />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
                    Zonas de atención cercana
                  </p>

                  <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
                    Coordinamos consultas y entregas en zonas cercanas.
                  </h2>

                  <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
                    Trabajamos principalmente alrededor de El Pato, Berazategui
                    y La Plata. Algunas localidades se evalúan según producto,
                    disponibilidad y recorrido.
                  </p>
                </div>

                <Link
                  href="/contacto"
                  className="tap-feedback inline-flex w-fit min-h-11 items-center justify-center rounded-2xl border border-[#B7CADA] bg-white px-5 py-2.5 text-sm font-black text-[var(--brand-blue-dark)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] focus-ring"
                >
                  Consultar zona
                </Link>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {serviceAreas.map((zone) => (
                  <article
                    key={zone.title}
                    className="rounded-[1.5rem] border border-[#C9D6E4] bg-[rgba(232,244,252,0.92)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
                  >
                    <span
                      className={`block h-1.5 w-12 rounded-full ${zone.accent}`}
                    />

                    <h3 className="mt-4 text-xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
                      {zone.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                      {zone.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {zone.areas.map((area) => (
                        <span
                          key={area}
                          className="rounded-full border border-[#D6E3EF] bg-[#F8FBFE] px-3 py-1.5 text-xs font-black text-[var(--brand-blue-dark)]"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-[#C9D6E4] bg-[var(--brand-blue-soft)] p-4">
                <p className="text-sm font-black text-[var(--brand-blue-dark)]">
                  La disponibilidad final se confirma con un asesor.
                </p>

                <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                  Esta información marca zonas habituales de atención cercana,
                  pero cada operación se coordina según producto, recorrido y
                  disponibilidad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container-page pb-12">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand-blue)]">
            Soluciones
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.025em] text-[var(--text-primary)]">
            Productos para cada necesidad.
          </h2>

          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
            Elegí productos para renovar tu casa, equipar tu comercio o resolver
            necesidades concretas de trabajo y uso diario.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {purchaseReasons.map((reason) => (
            <article
              key={reason.title}
              className="group overflow-hidden rounded-3xl border border-[#C9D6E4] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[var(--brand-blue)] hover:shadow-[var(--shadow-card)]"
            >
              <div className="relative h-48 bg-[var(--brand-blue-soft)]">
                <Image
                  src={reason.image}
                  alt={reason.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(11,53,88,0.42)_100%)]" />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-black text-[var(--text-primary)]">
                  {reason.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {reason.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page pb-14">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-[#082F49]/20 bg-[linear-gradient(135deg,#0B3558_0%,#0D4A73_58%,#0A5C86_100%)] p-7 text-white shadow-[var(--shadow-soft)] lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[rgba(37,211,102,0.16)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-[rgba(244,196,48,0.12)] blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white/65">
                Comercios
              </p>

              <h2 className="mt-3 max-w-xl text-3xl font-black tracking-[-0.025em] lg:text-4xl">
                ¿Tenés comercio? También podemos ayudarte.
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-white/78">
                Pedí la visita de un asesor y consultá beneficios de
                financiación con pagos semanales para equipar o renovar tu
                negocio.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.10] p-4">
                  <p className="text-sm font-black text-white">
                    Asesoramiento personalizado
                  </p>
                  <p className="mt-2 text-xs leading-5 text-white/70">
                    Un asesor te orienta según el tipo de producto que
                    necesitás.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.10] p-4">
                  <p className="text-sm font-black text-white">
                    Pagos semanales
                  </p>
                  <p className="mt-2 text-xs leading-5 text-white/70">
                    Consultá alternativas pensadas para comercios y actividad
                    diaria.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={commerceWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex justify-center rounded-2xl bg-[var(--whatsapp)] px-6 py-3 text-sm font-black text-slate-950 shadow-[0_14px_30px_rgba(37,211,102,0.28)] transition hover:-translate-y-0.5 hover:bg-[var(--whatsapp-dark)] hover:text-white focus-ring"
                >
                  Solicitar asesoramiento
                </a>

                <Link
                  href="/productos"
                  className="inline-flex justify-center rounded-2xl border border-white/20 bg-white/[0.08] px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/[0.14] focus-ring"
                >
                  Ver productos
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-3 rounded-[2.25rem] border border-white/10 bg-white/[0.08]" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.10] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.20)]">
                <div className="relative h-[360px] overflow-hidden rounded-[1.5rem] bg-white/10 sm:h-[420px]">
                  <Image
                    src="/home/asesor-comercio-credifer.webp"
                    alt="Asesor de Credifer acompañando a un comercio"
                    fill
                    sizes="(max-width: 1024px) 100vw, 560px"
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,53,88,0.02)_0%,rgba(11,53,88,0.58)_100%)]" />

                  <div className="absolute bottom-4 left-4 right-4 rounded-3xl border border-white/14 bg-white/90 p-5 text-[var(--text-primary)] shadow-[0_18px_40px_rgba(15,23,42,0.18)] backdrop-blur">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-blue)]">
                      Atención cercana
                    </p>

                    <h3 className="mt-2 text-xl font-black">
                      Un asesor te ayuda a coordinar productos, financiación y
                      entrega.
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[var(--brand-blue-soft)] px-3 py-1 text-xs font-black text-[var(--brand-blue)]">
                        Comercio
                      </span>
                      <span className="rounded-full bg-[var(--brand-blue-soft)] px-3 py-1 text-xs font-black text-[var(--brand-blue)]">
                        Financiación
                      </span>
                      <span className="rounded-full bg-[var(--brand-blue-soft)] px-3 py-1 text-xs font-black text-[var(--brand-blue)]">
                        Entrega
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
