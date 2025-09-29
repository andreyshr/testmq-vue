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

  for (let y = 1700; y <= 2035; y++) {
    years.push(y);
  }

  return years;
}

// if its neccessary to get range for 120 years you can use something like
//   const years = [];
//   const currentYear = new Date().getFullYear();

//   for (let y = currentYear - 120; y <= currentYear; y++) {
//     years.push(y);
//   }

//   return years;
