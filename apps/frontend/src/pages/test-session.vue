<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Test User Session API</h1>

    <div class="flex gap-4 mb-6">
      <button 
        @click="sessionTest.testCreateSession()" 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        :disabled="sessionTest.loading"
      >
        Test Create Session
      </button>

      <button 
        @click="sessionTest.testGetActiveUsers()" 
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        :disabled="sessionTest.loading"
      >
        Test Get Active Users
      </button>

      <button 
        @click="sessionTest.testRawFetch()" 
        class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        :disabled="sessionTest.loading"
      >
        Test Raw Fetch
      </button>

      <button 
        @click="userSession.initSession()" 
        class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        :disabled="sessionTest.loading"
      >
        Manual Init Session
      </button>
    </div>

    <div v-if="sessionTest.loading" class="mb-6">
      <p class="text-gray-700">Đang xử lý...</p>
    </div>

    <div v-if="sessionTest.error" class="mb-6 p-4 bg-red-100 text-red-700 rounded">
      <p><strong>Lỗi:</strong> {{ sessionTest.error }}</p>
    </div>

    <div v-if="sessionTest.result" class="mb-6">
      <h2 class="text-xl font-bold mb-2">Kết quả:</h2>
      <pre class="bg-gray-100 p-4 rounded overflow-auto max-h-80">{{ JSON.stringify(sessionTest.result, null, 2) }}</pre>
    </div>

    <div class="mt-8">
      <h2 class="text-xl font-bold mb-4">Session Info</h2>
      <div class="bg-gray-100 p-4 rounded">
        <p><strong>Session ID:</strong> {{ userSession.sessionId }}</p>
        <p><strong>Active:</strong> {{ userSession.isActive }}</p>
        <p><strong>Page Views:</strong> {{ userSession.pageViews }}</p>
        <p><strong>Current Page:</strong> {{ userSession.currentPage }}</p>
        <p><strong>Error:</strong> {{ userSession.error || 'None' }}</p>
      </div>
    </div>

    <div class="mt-8">
      <h2 class="text-xl font-bold mb-4">Network Debug</h2>
      <p class="mb-2">Để debug API calls:</p>
      <ol class="list-decimal ml-6">
        <li>Mở Chrome DevTools (F12)</li>
        <li>Chọn tab Network</li>
        <li>Bật "Preserve log"</li>
        <li>Refresh trang và nhấn các nút test</li>
        <li>Filter requests với từ khóa "trpc" hoặc "session"</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionTest } from '@/composables/useSessionTest';
import { useUserSession } from '@/composables/useUserSession';

const sessionTest = useSessionTest();
const userSession = useUserSession();
</script> 