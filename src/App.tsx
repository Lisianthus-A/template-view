import styles from "./App.module.scss";
import { Header, Sidebar, Canvas } from "@/components";

function App() {
  return (
    <div className={styles.app}>
      <Header />
      <Sidebar />
      <Canvas />
    </div>
  );
}

export default App;
