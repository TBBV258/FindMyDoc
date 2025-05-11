// Add Next.js API route types that are used by the API handlers
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}

interface NextApiRequest {
  method?: string;
  query: {
    [key: string]: string | string[] | undefined;
  };
  body: any;
}

interface NextApiResponse {
  status(code: number): NextApiResponse;
  json(data: any): void;
  end(): void;
}