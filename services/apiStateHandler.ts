export type ApiState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

export const idle = <T>(): ApiState<T> => ({ status: "idle" });
export const loading = <T>(): ApiState<T> => ({ status: "loading" });
export const success = <T>(data: T): ApiState<T> => ({ status: "success", data });
export const failure = <T>(error: string): ApiState<T> => ({ status: "error", error });
