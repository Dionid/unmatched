export type ExpandedResponse<T extends Record<PropertyKey, unknown>> = {
  status: number;
  response: Response;
  data: T;
};

export const expandedFetch = async <T extends Record<PropertyKey, unknown>>(
  request: Promise<Response>
): Promise<ExpandedResponse<T>> => {
  const response = await request;

  return {
    status: response.status,
    response,
    data: await response.json(),
  };
};

export type EitherResponse<T extends Record<PropertyKey, unknown>> =
  | {
      status: "success";
      code: number;
      response: Response;
      data: T;
    }
  | {
      status: "error";
      code: number;
      response: Response | null;
      message: string;
      originalError: Error | null;
    };

export const eitherFetch = async <T extends Record<PropertyKey, unknown>>(
  request: Promise<Response>
): Promise<EitherResponse<T>> => {
  try {
    const response = await request;

    if (response.ok) {
      return {
        status: "success",
        code: response.status,
        response,
        data: (await response.json()) as T,
      };
    } else {
      const data = await response.json();

      let message = response.statusText;
      if (data && typeof data === "object") {
        if (data.message) {
          message = data.message;
        } else if (data.error) {
          message = data.error;
        } else {
          message = JSON.stringify(data);
        }
      }

      return {
        status: "error",
        code: response.status,
        response,
        message: message,
        originalError: null,
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        status: "error",
        code: 500,
        response: null,
        message: JSON.stringify(error),
        originalError: error,
      };
    }

    return {
      status: "error",
      code: 500,
      response: null,
      message: "Unknown error",
      originalError: null,
    };
  }
};
