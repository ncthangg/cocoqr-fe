export interface ApiSuccessResponse<T> {
    data: T;
    additionalData: any;
    message: string | null;
    code: string;
}

export interface CustomErrorResponse {
    error: any;
    errorCode: string;
    errorMessage: string;
}

export interface AspNetValidationErrorResponse {
    type: string;
    title: string;
    status: number;
    errors: Record<string, string[]>;
    traceId: string;
}