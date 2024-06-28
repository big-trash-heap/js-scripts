/**
 * @example
 * ```js
const valueDelay = (text, delay) => {
    return new Promise((resolve) => {
        setTimeout(() => {
          resolve(text);
        }, delay);
    });
};

const fn = throttle(valueDelay, 1500);

setTimeout(
    async () =>
        console.log(await fn("Hello 100 ms", 4000)),
    10
);
setTimeout(
    async () =>
        console.log(await fn("Hello 150 ms", 5000)),
    150
);
setTimeout(
    async () =>
        console.log(await fn("Hello 450 ms", 25000)),
    450
);
setTimeout(
    async () =>
        console.log(await fn("Hello 1400 ms", 25000)),
    1400
);
setTimeout(
    async () =>
        console.log(await fn("Hello 1600 ms", 2000)),
    1600
);

// Prints:
// > Hello 1600 ms
// > Hello 100 ms
// > Hello 100 ms
// > Hello 100 ms
// > Hello 100 ms
 * ```
 * @template { (...args: any) => any } T
 * @param { T } fn
 * @param { number } [delay=1000]
 * @returns { (...args: Parameters<T>) => ReturnType<T> }
 */
export const throttle = (fn, delay) => {
  let throttled = false;
  let closure = null;

  return function (...args) {
    if (!throttled) {
      throttled = true;

      setTimeout(() => {
        throttled = false;
        closure = null;
      }, delay);

      closure = fn.apply(this, args);
      return closure;
    } else {
      return closure;
    }
  };
};
