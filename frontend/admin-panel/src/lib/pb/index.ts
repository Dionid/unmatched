import { ClientResponseError } from "pocketbase";
import { eitherFetch, EitherResponse } from "../http";

export const eitherFetchPb = async <T extends Record<PropertyKey, unknown>>(
  request: Promise<Response>
): Promise<EitherResponse<T>> => {
  const response = await eitherFetch<T>(request);
  if (response.status === "error") {
    if (response.originalError instanceof ClientResponseError) {
      let message = response.originalError.message;
      if (response.originalError.data) {
        if (response.originalError.data.message) {
          message = response.originalError.data.message;
        } else if (response.originalError.data.error) {
          message = response.originalError.data.error;
        } else {
          message = JSON.stringify(response.originalError.data);
        }
      }

      return {
        status: "error",
        code: response.code,
        response: response.response,
        message: message,
        originalError: response.originalError,
      };
    }

    return response;
  }

  return response;
};
