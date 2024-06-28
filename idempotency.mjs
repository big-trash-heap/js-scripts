/**
 * @template { (...args: any) => any } T
 * @param { T } fn
 * @param { () => string } idempotent
 * @returns { (...args: Parameters<T>) => ReturnType<T> }
 */
export const idempotency = (fn, idempotent) => {
  let key = null;
  let closure = null;

  return function (...args) {
    const newkey = idempotent.apply(this, []);
    if (key === newkey) {
      return closure;
    }

    key = newkey;
    closure = fn.apply(this, args);
    return closure;
  };
};
