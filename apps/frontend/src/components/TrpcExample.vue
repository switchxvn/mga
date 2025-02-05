<template>
  <div>
    <h2>tRPC Example</h2>
    <div class="mb-4">
      <input 
        v-model="name" 
        type="text" 
        placeholder="Enter your name"
        class="px-4 py-2 border rounded"
      >
      <button 
        @click="sayHello"
        class="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Loading...' : 'Say Hello' }}
      </button>
    </div>

    <!-- Results -->
    <div class="mt-4">
      <div v-if="isLoading" class="text-gray-600">Loading...</div>
      <div v-else-if="error" class="text-red-500">Error: {{ error }}</div>
      <div v-else-if="greeting" class="text-green-600 text-xl">
        {{ greeting }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RouterOutput } from '../types/trpc';
import { TRPCClientError } from '@trpc/client';
import { useTrpc } from '../utils/trpc';

const trpc = useTrpc();
const name = ref('');
const greeting = ref('');
const error = ref('');
const isLoading = ref(false);

type HelloResponse = RouterOutput['example']['hello'];

const sayHello = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    const result = await trpc.example.hello.query({ 
      name: name.value || undefined 
    });
    greeting.value = result.greeting;
  } catch (err) {
    if (err instanceof TRPCClientError) {
      error.value = err.message;
    } else {
      error.value = 'An error occurred';
    }
  } finally {
    isLoading.value = false;
  }
};

// Initial greeting
sayHello();</script> 