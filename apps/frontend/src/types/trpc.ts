import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../backend/src/trpc/routers/_app';

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

// This is temporary until we fix the import issue
export type { AppRouter }; 