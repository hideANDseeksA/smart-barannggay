export function lowercaseDeep<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(lowercaseDeep) as unknown as T;
  }

  if (obj && typeof obj === "object") {
    const newObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        newObj[key] = value.toLowerCase();
      } else if (value && typeof value === "object" && !(value instanceof Date)) {
        newObj[key] = lowercaseDeep(value);
      } else {
        newObj[key] = value;
      }
    }
    return newObj;
  }

  return obj;
}
