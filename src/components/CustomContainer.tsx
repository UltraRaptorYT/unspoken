import { ReactNode } from "react";

export default function CustomContainer({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
