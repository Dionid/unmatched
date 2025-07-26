import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PaasibleApi, PaasibleApiCfg } from "./api";

export const PaasibleApiContext = createContext<PaasibleApi>({} as PaasibleApi);

export const PaasibleApiProvider = ({
  children,
  config,
}: {
  children: React.ReactNode;
  config: PaasibleApiCfg;
}) => {
  const api = useMemo(() => PaasibleApi(config), [config]);

  return (
    <PaasibleApiContext.Provider value={api}>
      {children}
    </PaasibleApiContext.Provider>
  );
};

export const usePaasibleApi = (): PaasibleApi => {
  const context = useContext(PaasibleApiContext);

  const [, setIsAuthenticated] = useState<boolean>(
    context.pb.authStore.isValid
  );

  useEffect(() => {
    return context.pb.authStore.onChange(() => {
      console.log("authStore changed", context.pb.authStore.isValid);
      setIsAuthenticated(context.pb.authStore.isValid);
    });
  }, [context.pb.authStore]);

  if (!context) {
    throw new Error("usePaasibleApi");
  }

  return context;
};
