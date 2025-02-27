import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { AnyRouter, Router } from '@trpc/server';

// Định nghĩa interface AppRouter tạm thời để thỏa mãn constraint AnyRouter
interface AppRouter extends Router<any> {
  _def: any;
  createCaller: any;
  getErrorShape: any;
  auth: any;
  post: any;
  user: any;
  example: any;
}

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

// This is temporary until we fix the import issue
export type { AppRouter }; 