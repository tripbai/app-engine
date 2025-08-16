export const createMock = <T extends new (...args: any[]) => any>(
  classReference: T,
  mockObject: Partial<InstanceType<T>> | null = null
): InstanceType<T> => {
  if (mockObject === null) return {} as InstanceType<T>;
  return mockObject as InstanceType<T>;
};
