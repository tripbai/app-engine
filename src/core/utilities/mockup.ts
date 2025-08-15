export const createMock = <T extends new (...args: any[]) => any>(
  classReference: T,
  mockObject: Partial<InstanceType<T>>
): InstanceType<T> => {
  return mockObject as InstanceType<T>;
};
