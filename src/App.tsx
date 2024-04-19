import { useEffect, useState, createContext } from "react";
import { Header, Sidebar, Canvas } from "@/layout";
import { Loading } from "@/components";
import { delay } from "@/utils";
import { canvasRef } from "@/store";
import { ImageModel } from "@/models";
import styles from "./App.module.scss";

const initValue = {
  id: "",
  name: `新建画布${Date.now()}`,
  internal: false,
  type: "template",
  tag: "推荐位",
  image: "",
  data: null,
};

export const CanvasDataContext = createContext(initValue);

function App() {
  const [loading, setLoading] = useState(true);
  const [contextValue, setContextValue] = useState(initValue);

  useEffect(() => {
    delay(500).then(() => {
      setLoading(false);
    });

    // 粘贴图片
    const onPaste = (evt: ClipboardEvent) => {
      if (!evt.clipboardData || !canvasRef.current) {
        return;
      }
      for (let i = 0; i < evt.clipboardData.items.length; ++i) {
        const item = evt.clipboardData.items[i];
        if (item.type.indexOf("image") >= 0) {
          const file = item.getAsFile();
          if (file === null) {
            continue;
          }

          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = async (e) => {
            const res = e.target!.result as string;
            const model = await ImageModel.create({ imageUrl: res });
            canvasRef.current!.add(model);
          };
          break;
        }
      }
    };

    document.addEventListener("paste", onPaste);
    return () => {
      document.removeEventListener("paste", onPaste);
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.app}>
        <div className={styles.mask}>
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <CanvasDataContext.Provider value={contextValue}>
      <div className={styles.app}>
        <Header />
        <Sidebar />
        <Canvas />
      </div>
    </CanvasDataContext.Provider>
  );
}

export default App;
