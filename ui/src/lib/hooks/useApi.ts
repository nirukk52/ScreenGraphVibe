import { useCallback, useState } from 'react';
import type { ApiState } from '../api/types';

export function useApi<T>(request: () => Promise<{ ok: boolean; data?: T; error?: any }>) {
  const [state, setState] = useState<ApiState<T>>({ status: 'idle' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    const res = await request();
    if (res.ok) setState({ status: 'success', data: res.data as T });
    else setState({ status: 'error', error: res.error });
  }, [request]);

  return { state, load } as const;
}


