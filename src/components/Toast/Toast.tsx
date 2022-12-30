import ReactDOM from "react-dom/client";
import styles from "./Toast.module.scss";

class ToastController {
  private domContainer: HTMLDivElement | null = null;
  private reactRoot: ReactDOM.Root | null = null;
  private id: number = 0;
  private timer: number = 0;

  constructor() {
    this.destroy = this.destroy.bind(this);
  }

  private getContainer() {
    const dom = document.createElement("div");
    dom.id = `toast-root-${++this.id}`;
    dom.className = styles["toast-root"];
    document.body.append(dom);
    this.domContainer = dom;
    return dom;
  }

  private destroy() {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    if (this.domContainer) {
      document.body.removeChild(this.domContainer);
      this.domContainer = null;
    }
  }

  show(text: string, duration = 2000) {
    // 销毁上一个 Toast
    this.destroy();

    // 生成 Toast
    const container = this.getContainer();
    this.reactRoot = ReactDOM.createRoot(container);
    this.reactRoot.render(<div className={styles.toast}>{text}</div>);

    // 刷新销毁时间
    clearTimeout(this.timer);
    this.timer = window.setTimeout(this.destroy, duration);
  }
}

export default new ToastController();
