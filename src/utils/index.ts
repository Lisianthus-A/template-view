/**
 * 节流，ms 毫秒内，只执行一次函数
 * @param fn 函数
 * @param ms 毫秒数
 */
export const throttle = (fn: Function, ms: number) => {
  let canRun = true;
  return function (this: any) {
    if (canRun) {
      canRun = false;
      fn.call(this, ...arguments);
      setTimeout(() => {
        canRun = true;
      }, ms);
    }
  };
};

/**
 * 防抖，最后一次调用的 ms 毫秒后执行
 * @param fn 函数
 * @param ms 毫秒数
 */
export const debounce = (fn: Function, ms: number) => {
  let timer: number;
  return function (this: any) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.call(this, ...arguments);
    }, ms) as any;
  };
};

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const deepCompare = (o1: any, o2: any) => {
  const type1 = Object.prototype.toString.call(o1);
  const type2 = Object.prototype.toString.call(o2);

  if (type1 !== type2) {
    return false;
  }

  if (type1 === "[object Array]") {
    for (let i = 0; i < o1.length; ++i) {
      if (!deepCompare(o1[i], o2[i])) {
        return false;
      }
    }

    return true;
  } else if (type1 === "[object Object]") {
    for (const key in o1) {
      if (!deepCompare(o1[key], o2[key])) {
        return false;
      }
    }

    return true;
  }

  return o1 === o2;
};

export const deepClone = (target: any) => {
  // if (typeof structuredClone === "function") {
  //   return structuredClone(target);
  // }

  const type = Object.prototype.toString.call(target);
  if (type === "[object Array]") {
    return target.map((item: any) => deepClone(item));
  } else if (type === "[object Object]") {
    const o: Record<string, any> = {};
    for (const key in target) {
      o[key] = deepClone(target[key]);
    }
    return o;
  }

  return target;
};