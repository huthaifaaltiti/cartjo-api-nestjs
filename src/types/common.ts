// ---

export interface Name {
  ar: string;
  en: string;
}

export type Description = Name;

export type TranslatedText = Name;

// ---

export interface FetchPaginatedArgs {
  token: string;
  lang?: string;
  limit?: number;
  lastId?: string;
  search?: string;
}

// --

export interface ErrorPageProps {
  error?: Error & { digest?: string };
  reset?: () => void;
}

// --

export type Actor = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export interface FetchError extends Error {
  status?: number;
  details?: any;
}
