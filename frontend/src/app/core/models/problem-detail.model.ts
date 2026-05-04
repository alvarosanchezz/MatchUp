export interface ProblemDetail {
  type?: string;
  title?: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Array<{ field: string; message: string }>;
}
