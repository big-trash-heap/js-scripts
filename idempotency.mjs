/**
 * @template { (...args: any) => any } T
 * @param { T } fn
 * @param { () => string } idempotent
 * @param { boolean } [rollbackOnError=true]
 * @returns { (...args: Parameters<T>) => ReturnType<T> }
 */
export const idempotency = (fn, idempotent, rollbackOnError = true) => {
  let key = null;
  let prevkey = null;
  let closure = null;

  return function (...args) {
    const newkey = idempotent.apply(this, []);
    if (key === newkey) {
      return closure;
    }

    prevkey = key;
    key = newkey;

    try {
      closure = fn.apply(this, args);

      if (closure instanceof Promise) {
        const basekey = newkey;
        return closure.catch((error) => {
          if (rollbackOnError && key === basekey) {
            key = prevkey;
          }
          throw error;
        });
      }

      return closure;
    } catch (error) {
      if (rollbackOnError) {
        key = prevkey;
      }
      throw error;
    }
  };
};
