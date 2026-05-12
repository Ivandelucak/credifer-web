"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, CartProduct } from "@/types/cart";

type CartContextValue = {
  items: CartItem[];
  isHydrated: boolean;
  itemsCount: number;
  totalAmount: number;
  addItem: (product: CartProduct) => void;
  removeItem: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
};

const CART_STORAGE_KEY = "credifer_cart";

const CartContext = createContext<CartContextValue | null>(null);

function parsePrice(price: string | null): number {
  if (!price) return 0;

  const value = Number(price);

  return Number.isFinite(value) ? value : 0;
}

function normalizeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (
        typeof item !== "object" ||
        item === null ||
        !("id" in item) ||
        !("name" in item) ||
        !("slug" in item)
      ) {
        return null;
      }

      const cartItem = item as Partial<CartItem>;

      return {
        id: Number(cartItem.id),
        name: String(cartItem.name ?? ""),
        slug: String(cartItem.slug ?? ""),
        price:
          cartItem.price === null || cartItem.price === undefined
            ? null
            : String(cartItem.price),
        imageUrl:
          cartItem.imageUrl === null || cartItem.imageUrl === undefined
            ? null
            : String(cartItem.imageUrl),
        brandName:
          cartItem.brandName === null || cartItem.brandName === undefined
            ? null
            : String(cartItem.brandName),
        categoryName:
          cartItem.categoryName === null || cartItem.categoryName === undefined
            ? null
            : String(cartItem.categoryName),
        quantity: Math.max(1, Number(cartItem.quantity || 1)),
      };
    })
    .filter((item): item is CartItem => {
      return Boolean(item && item.id && item.name && item.slug);
    });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setItems(normalizeCartItems(parsedCart));
      }
    } catch {
      setItems([]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  const addItem = useCallback((product: CartProduct) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId),
    );
  }, []);

  const increaseQuantity = useCallback((productId: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  }, []);

  const decreaseQuantity = useCallback((productId: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    const safeQuantity = Math.max(0, Math.floor(quantity));

    setItems((currentItems) => {
      if (safeQuantity <= 0) {
        return currentItems.filter((item) => item.id !== productId);
      }

      return currentItems.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: safeQuantity,
            }
          : item,
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (productId: number) => {
      return items.some((item) => item.id === productId);
    },
    [items],
  );

  const itemsCount = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce((total, item) => {
      return total + parsePrice(item.price) * item.quantity;
    }, 0);
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isHydrated,
      itemsCount,
      totalAmount,
      addItem,
      removeItem,
      increaseQuantity,
      decreaseQuantity,
      updateQuantity,
      clearCart,
      isInCart,
    }),
    [
      items,
      isHydrated,
      itemsCount,
      totalAmount,
      addItem,
      removeItem,
      increaseQuantity,
      decreaseQuantity,
      updateQuantity,
      clearCart,
      isInCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider.");
  }

  return context;
}
