import { ErrorPage } from "@/shared/components/ErrorPage";

export function Forbidden() {
  return <ErrorPage code="403" />;
}
