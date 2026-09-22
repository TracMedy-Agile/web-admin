"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type FacilitiesRegisterBoundaryProps = {
  initialOpen: boolean;
  children: React.ReactNode;
  modal: React.ReactNode;
};

export function FacilitiesRegisterBoundary({ initialOpen, children, modal }: FacilitiesRegisterBoundaryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(initialOpen);

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a");
    if (!(anchor instanceof HTMLAnchorElement)) return;
    const destination = new URL(anchor.href, window.location.href);
    if (destination.pathname !== pathname) return;

    if (destination.searchParams.get("register") === "1") {
      event.preventDefault();
      setOpen(true);
      return;
    }

    if (open && destination.search === "") {
      event.preventDefault();
      setOpen(false);
      router.replace(pathname);
    }
  }

  return (
    <div onClickCapture={handleClick}>
      {children}
      {open ? modal : null}
    </div>
  );
}