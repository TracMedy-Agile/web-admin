import Image from "next/image";
import { ShieldLockIcon } from "./icons";

type AuthShellProps = {
  children: React.ReactNode;
  centered?: boolean;
};

export function AuthShell({ children, centered = true }: AuthShellProps) {
  const rightPanelClass = [
    "flex min-h-screen justify-center bg-white px-6 py-12 sm:px-10 lg:px-0",
    centered ? "items-center" : "items-start lg:pt-[260px]",
  ].join(" ");

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[704px_1fr]">
      <section className="flex min-h-[420px] flex-col bg-admin-panel px-8 py-10 text-white sm:px-12 lg:min-h-screen lg:py-[72px]">
        <div className="flex items-center gap-4">
          <Image src="/tracmedy_logo.svg" alt="Tracmedy" width={44} height={44} priority className="h-11 w-11" />
          <span className="text-[22px] font-bold tracking-normal sm:text-[24px]">TRACMEDY</span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-16 lg:py-20">
          <div className="max-w-[545px]">
            <h1 className="text-[34px] font-bold leading-[1.12] tracking-normal sm:text-[40px]">Admin Access</h1>
            <p className="mt-4 max-w-[500px] text-[18px] font-medium leading-[1.45] tracking-normal text-admin-cyan sm:text-[20px]">
              Secure system login for authorized personnel only.
            </p>
          </div>
        </div>

        <div className="flex min-h-[68px] max-w-[420px] items-center gap-4 rounded-[10px] bg-admin-chip px-5 py-4 lg:w-[420px]">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-admin-panel-deep text-admin-chip-icon">
            <ShieldLockIcon className="h-6 w-6" />
          </div>
          <span className="text-[17px] font-semibold leading-tight text-admin-chip-icon sm:text-[18px]">Secure authentication</span>
        </div>
      </section>

      <section className={rightPanelClass}>
        <div className="w-full max-w-[430px]">{children}</div>
      </section>
    </main>
  );
}
