/**
 * Pulls all props to be passed into a constructor.
 * EXAMPLE:
 * GetConstructorArgs<typeof Error> === [message: string | undefined]
 */
export type GetConstructorArgs<T> = T extends new (...args: infer U) => any
  ? U
  : never;
