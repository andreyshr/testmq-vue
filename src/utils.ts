/**
 * Request for data
 * @param url request
 * @returns data
 */
export async function getData<T>(url: string): Promise<T[]> {
  const res = await fetch(url);

  if (res.ok) {
    return await res.json();
  }

  throw new Error();
}

export function useLatestOnly<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
) {
  let callId = 0;

  return async (...args: TArgs): Promise<TResult | undefined> => {
    const id = ++callId;
    const result = await fn(...args);
    if (id !== callId) return;
    return result;
  };
}

export function getRange() {
  const years = [];
  const currentYear = new Date().getFullYear();

  for (let y = currentYear - 120; y <= currentYear; y++) {
    years.push(y);
  }

  return years;
}
