<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">tRPC Test Page</h1>
    
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

    <!-- Manual Test Section -->
    <div class="mt-8 border-t pt-4">
      <h2 class="text-xl font-semibold mb-4">Manual Test</h2>
      <button 
        @click="testManual"
        class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        :disabled="isManualLoading"
      >
        {{ isManualLoading ? 'Loading...' : 'Test Direct Call' }}
      </button>
      <div v-if="manualResult" class="mt-2 text-purple-600">
        {{ manualResult }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RouterOutput } from '../types/trpc';
import { TRPCClientError } from '@trpc/client';
import { useTrpc } from '../composables/useTrpc';
import { ref } from '../composables/useVueComposables';

const trpc = useTrpc();
const name = ref('');
const greeting = ref('');
const error = ref('');
const isLoading = ref(false);
const manualResult = ref('');
const isManualLoading = ref(false);

// Định nghĩa kiểu dữ liệu cho response
interface HelloResponse {
  greeting: string;
}

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

const testManual = async () => {
  try {
    isManualLoading.value = true;
    const result = await trpc.example.hello.query({ name: 'Direct Test' });
    manualResult.value = result.greeting;
  } catch (err) {
    if (err instanceof TRPCClientError) {
      manualResult.value = `Error: ${err.message}`;
    } else {
      manualResult.value = 'An error occurred';
    }
  } finally {
    isManualLoading.value = false;
  }
};

// Initial greeting
sayHello();
</script> 