type Listener = (...args: any[]) => void;

class EventBus {
  listenerMap: Record<string, any[]>;

  constructor() {
    // 已添加监听的事件映射
    this.listenerMap = {};
  }

  /**
   * 添加事件监听
   * @param type 事件类型
   * @param listener 处理函数
   */
  on(type: string, listener: Listener) {
    const { listenerMap } = this;
    if (listenerMap[type]) {
      listenerMap[type].push(listener);
    } else {
      listenerMap[type] = [listener];
    }
  }

  /**
   * 移除事件监听
   * @param type 事件类型
   * @param listener 处理函数
   */
  off(type: string, listener: Listener) {
    const listeners = this.listenerMap[type];
    if (!listeners) {
      return;
    }
    const index = listeners.indexOf(listener);
    index >= 0 && listeners.splice(index, 1);
  }

  /**
   * 触发事件
   * @param type 事件类型
   * @param args 触发事件时传入的值
   */
  emit(type: string, ...args: any[]) {
    const listeners = this.listenerMap[type];
    if (!listeners) {
      return;
    }

    listeners.forEach((listener) => {
      listener(...args);
    });
  }
}

export default new EventBus();
