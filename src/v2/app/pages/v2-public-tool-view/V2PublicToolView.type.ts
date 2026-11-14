import type { V2PublicToolDef } from "@/v2/app/router/publicTools.config";
import type { V2BaseProps } from "@/v2/shared/types";

export interface V2PublicToolViewProps extends V2BaseProps {
  tool: V2PublicToolDef;
  isLoggedIn: boolean;
}
