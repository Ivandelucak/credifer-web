import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/CartPageContent";

export const metadata: Metadata = {
  title: "Carrito",
  description:
    "Revisá tus productos seleccionados y enviá una consulta por WhatsApp a Credifer.",
};

export default function CartPage() {
  return <CartPageContent />;
}
