import { ClientResponseError } from "pocketbase";
import { useMemo, useState, useCallback } from "react";

export type DiqResult<P extends unknown[], R> = {
  isPending: boolean;
  error: Error | null;
  data: R | undefined;
  request: (...args: P) => Promise<R | Error>;
};

export function useDiq<P extends unknown[], R>(
  query: (...args: P) => Promise<R>,
  opts:
    | {
        ignoreError?: boolean;
      }
    | undefined = undefined
): DiqResult<P, R> {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<R>();

  const request = useCallback(
    async (...args: P) => {
      setIsPending(true);
      setError(null);
      try {
        const result = await query(...args);
        setData(result);
        return result;
      } catch (err) {
        if (!(err instanceof Error)) {
          setError(err as Error);
          return err as Error;
        }

        if (opts && opts.ignoreError) {
          return err as Error;
        }

        let message = err.message;
  
        if (err instanceof ClientResponseError) {
          if (err.data.data) {
            message += ".\n";
            for (const [key, value] of Object.entries(err.data.data)) {
              let valueMessage = "";
              if (value && typeof value === "object" && "message" in value && typeof value.message === "string") {
                valueMessage = value.message;
              } else {
                valueMessage = String(value);
              }
              message += `${key}: ${valueMessage}\n\n`
            }
          }
        }

        err.message = message;

        setError(err);
        return err;
      } finally {
        setIsPending(false);
      }
    },
    [opts, query]
  );

  const result = useMemo(() => {
    return {
      isPending,
      error,
      data,
      request,
    };
  }, [data, error, isPending, request]);

  return result;
}
