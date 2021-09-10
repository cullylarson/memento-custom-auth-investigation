import { ReactNode } from "react";

type ErrorMessageProps = {
  children: ReactNode;
};

export function ErrorMessage({ children }: ErrorMessageProps) {
  return (
    <ul>
      <li>{children}</li>
    </ul>
  );
}
