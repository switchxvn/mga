import { ref, onMounted, useNuxtApp } from '#imports';
import { v4 as uuidv4 } from 'uuid';
import { useIpInfo } from './useIpInfo';

export function useSession() {
  const nuxtApp = useNuxtApp();
  const trpc = nuxtApp.$trpc;
  const ipInfo = useIpInfo();
  
  const sessionId = ref<string>('');
  const isNewSession = ref<boolean>(false);
  
  // Initialize session
  const initSession = async () => {
    // Check if session exists in localStorage
    let existingSessionId = localStorage.getItem('sessionId');
    
    // If no session exists, create a new one
    if (!existingSessionId) {
      existingSessionId = uuidv4();
      localStorage.setItem('sessionId', existingSessionId);
      isNewSession.value = true;
    }
    
    sessionId.value = existingSessionId;
    
    // Get IP and country information
    const ipData = await ipInfo.getIpInfo();
    
    // Start or update session in backend
    if (isNewSession.value) {
      try {
        await trpc.userSession.startSession.mutate({
          sessionId: sessionId.value,
          ipAddress: ipData.ip,
          country: ipData.country,
          userAgent: navigator.userAgent,
          deviceInfo: {
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            language: navigator.language,
            platform: navigator.platform
          }
        });
      } catch (error) {
        console.error('Failed to start session:', error);
      }
    } else {
      // Update existing session
      try {
        await trpc.userSession.updateSession.mutate({
          sessionId: sessionId.value,
          lastActivity: new Date(),
        });
        
        // Update country if it wasn't set before
        if (ipData.country) {
          await trpc.userSession.updateSession.mutate({
            sessionId: sessionId.value,
            country: ipData.country
          });
        }
      } catch (error) {
        console.error('Failed to update session:', error);
      }
    }
    
    return {
      sessionId: sessionId.value,
      isNewSession: isNewSession.value
    };
  };
  
  // End the current session
  const endSession = async () => {
    if (!sessionId.value) return;
    
    try {
      await trpc.userSession.endSession.mutate({
        sessionId: sessionId.value
      });
      localStorage.removeItem('sessionId');
      sessionId.value = '';
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };
  
  // Auto-initialize the session when the component mounts
  onMounted(async () => {
    await initSession();
    
    // Set up interval to refresh the session activity
    const refreshInterval = setInterval(async () => {
      if (sessionId.value) {
        try {
          await trpc.userSession.updateSession.mutate({
            sessionId: sessionId.value,
            lastActivity: new Date()
          });
        } catch (error) {
          console.error('Failed to refresh session:', error);
        }
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    // Clean up interval on component unmount
    nuxtApp.hook('app:unmounted', () => {
      clearInterval(refreshInterval);
    });
  });
  
  return {
    sessionId,
    isNewSession,
    initSession,
    endSession
  };
} 