import { useCallback, useState } from "react";

export function useBloomState() {
  const [toast, setToast] = useState<string | null>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  return { toast, notify };
}
