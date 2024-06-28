/**
 * @description Добавляет задержку в ожидание Promise
 * @template T
 * @param { object } props
 * @param { () => Promise<T> } props.factory
 * @param { number } props.delayms
 * @param { boolean } [props.forceError=false]
 * @returns { Promise<T> }
 */
export function awaitPromise({ factory, delayms, forceError = false }) {
  const promiseSleep = new Promise((resolve) => setTimeout(resolve, delayms));
  const promiseResult = factory();

  if (forceError) {
    return Promise.all([promiseSleep, promiseResult]).then(() => {
      return promiseResult;
    });
  }

  const promiseSafeResult = promiseResult
    .then((ok) => ({ ok }))
    .catch((err) => ({ err }));

  return Promise.all([promiseSleep, promiseSafeResult]).then(([, result]) => {
    if ("ok" in result) {
      return result.ok;
    } else {
      throw result.err;
    }
  });
}
