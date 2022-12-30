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

/**
 * 获取随机 id
 */
export const getRandomId = () => String((Math.random() * 100000000) >> 0);
