import { ReactNode } from "react";

export default async function LecturerTeamsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="h-full w-full">{children}</div>;
}
