declare module "eslint-plugin-import" {
  import type { Linter } from "eslint";

  export const flatConfigs: {
    [key: string]: Linter.Config | undefined;
    recommended: Linter.Config;
    typescript: Linter.Config;
  };
}
