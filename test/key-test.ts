export const getKeyTest = (obj: object) => {
  // Set up the keys.
  const tested: Record<string, boolean> = {};
  for (const key of Object.keys(obj)) tested[key] = false;

  const testKey = (key: string) => {
    if (tested[key] == null) return false;
    tested[key] = true;
    return true;
  };

  testKey.getUntested = () => {
    return Object.entries(tested).reduce((prev, [key, isTested]) => {
      if (!isTested) prev.push(key);
      return prev;
    }, [] as string[]);
  };
  return testKey;
};
