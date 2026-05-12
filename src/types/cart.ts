export type CartProduct = {
  id: number;
  name: string;
  slug: string;
  price: string | null;
  imageUrl: string | null;
  brandName: string | null;
  categoryName: string | null;
};

export type CartItem = CartProduct & {
  quantity: number;
};
