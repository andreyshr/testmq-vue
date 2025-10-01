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

export function getRange() {
  const years = [];

  for (let y = 1700; y <= 2035; y++) {
    years.push(y);
  }

  return years;
}

// if it's neccessary to get range of 120 years you can use something like
// export function getRange() {
//   const years = [];
//   const currentYear = new Date().getFullYear();

//   for (let y = currentYear - 120; y <= currentYear; y++) {
//     years.push(y);
//   }

//   return years;
// }
