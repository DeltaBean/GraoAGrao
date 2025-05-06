import { useEffect, useState } from "react";

export interface LoadingData {
  isLoading: boolean;
  message: string;
}

/**
 * Default loading state
 */
function createDefaultLoadingData(): LoadingData {
  return {
    isLoading: false,
    message: "Carregando...",
  };
}

/**
 * Custom hook to manage loading state and message.
 * Uses functional updates to avoid stale closures.
 */
export function useLoading(initial?: LoadingData) {
  const [loadingData, setLoadingData] = useState<LoadingData>(
    initial ?? createDefaultLoadingData()
  );

  useEffect(() => {
      if (initial) {
        setLoadingData(initial);
      }
    }, [initial]);

  function setIsLoading(isLoading: boolean) {
    setLoadingData(prev => ({
      ...prev,
      isLoading,
    }));
  }

  function setMessage(message: string) {
    setLoadingData(prev => ({
      ...prev,
      message,
    }));
  }

  return {
    loadingData,
    setIsLoading,
    setMessage,
  };
}
