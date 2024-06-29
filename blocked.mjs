const TOKEN_BLOCKED = Symbol("blocked");

/**
 * @template { (...args: any) => any } T
 * @param { T } fn
 * @returns { T }
 */
export const blocked = (fn) => {
  let closure = null;

  const method = function (...args) {
    if (closure) {
      return closure;
    }

    const result = fn.apply(this, args);

    if (!(result instanceof Promise)) {
      return result;
    }

    closure = result;
    method[TOKEN_BLOCKED] = true;

    return result.finally(() => {
      closure = null;
      method[TOKEN_BLOCKED] = false;
    });
  };

  return method;
};

/**
 * @param { (...args: any) => any } fn
 * @returns { boolean }
 */
blocked.isBlocked = (fn) =>
  typeof fn === "function" && fn[TOKEN_BLOCKED] === true;
