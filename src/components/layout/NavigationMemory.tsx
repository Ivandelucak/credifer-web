"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const CURRENT_URL_KEY = "credifer-current-url";
const HAS_INTERNAL_HISTORY_KEY = "credifer-has-internal-history";

export function NavigationMemory() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const queryString = searchParams.toString();
    const currentUrl = queryString ? `${pathname}?${queryString}` : pathname;

    const previousUrl = window.sessionStorage.getItem(CURRENT_URL_KEY);

    if (previousUrl && previousUrl !== currentUrl) {
      window.sessionStorage.setItem(HAS_INTERNAL_HISTORY_KEY, "true");
    }

    window.sessionStorage.setItem(CURRENT_URL_KEY, currentUrl);
  }, [pathname, searchParams]);

  return null;
}
