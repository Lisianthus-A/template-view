import styles from "./App.module.scss";
import { Header, Sidebar, Canvas } from "@/layout";
import { Loading, Toast } from "@/components";
import { useEffect, useState, createContext } from "react";
import { delay } from "@/utils";
import { getItemById } from "@/utils/api";

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
    const getData = async () => {
      const params = new URLSearchParams(location.search);
      const id = params.get("id");
      if (!id) {
        return;
      }

      const res = await getItemById(id);
      if (res.code !== 0) {
        await delay(500);
        return Toast.show(res.text);
      }
      setContextValue(res.data);
    };

    Promise.all([getData(), delay(500)]).then(() => {
      setLoading(false);
    });
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
