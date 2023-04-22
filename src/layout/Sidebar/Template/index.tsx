import styles from "./index.module.scss";
import { Collection } from "@/components";

function Template() {
  return (
    <div className={styles.template}>
      <Collection type="template" />
    </div>
  );
}

export default Template;
