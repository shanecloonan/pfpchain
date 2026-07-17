import TestnetShell from "./testnet-shell";

export default function TestnetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TestnetShell>{children}</TestnetShell>;
}
