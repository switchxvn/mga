declare module '#imports' {
  export const useRuntimeConfig: () => {
    public: {
      apiBase: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
} 