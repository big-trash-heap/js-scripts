/**
 * Это позволяет на время исполнения замкнуть запрос с тем же ключём,
 * это работает для асинхронных методов
 *
 * const getUser = ({ id }) => { return ... };
 * const idempGetUser = idempotency(({ id }) => getUser({ id }), ({ id }) => id);
 *
 * const promise1 = idempGetUser({ id: 12 });
 * const promise2 = idempGetUser({ id: 12 });
 * const promise3 = idempGetUser({ id: 13 });
 *
 * console.log(promise1 === promise2); // true
 * console.log(promise1 === promise3); // false
 *
 * await Promise.all([promise1, promise2, promise3]);
 * const promise4 = idempGetUser({ id: 12 });
 *
 * console.log(promise1 === promise4); // false
 */

/**
 * @template { (...args: any) => any } T
 * @param { T } fn
 * @param { (...args: Parameters<T>) => string } idempotent
 * @param { boolean } [rollbackOnError=true]
 * @returns { (...args: Parameters<T>) => ReturnType<T> }
 */
export const idempotency = (fn, idempotent, rollbackOnError = true) => {
  let key = null;
  let prevkey = null;
  let closure = null;

  return function (...args) {
    const newkey = idempotent.apply(this, args);
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
