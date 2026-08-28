export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const data = (await response.json()) as { message?: string };
    return new ApiError(response.status, data.message ?? "リクエストに失敗しました");
  } catch {
    return new ApiError(response.status, "リクエストに失敗しました");
  }
}
