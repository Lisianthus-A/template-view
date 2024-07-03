import styles from "./index.module.scss";
import { Button, TextCollection } from "@/components";
import { canvasRef } from "@/store";
import { TextModel } from "@/models";
import { useState } from "react";

function Text() {
  const [loading, setLoading] = useState(false);

  const handleAddText = async () => {
    if (loading) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    setLoading(true);
    const text = await TextModel.create();
    canvas.add(text);
    setLoading(false);
  };

  return (
    <div className={styles.text}>
      <Button
        style={{ width: "100%" }}
        onClick={handleAddText}
        loading={loading}
      >
        添加文本
      </Button>
      <div className="divider" />
      <TextCollection onLoading={(isDone) => setLoading(!isDone)} />
    </div>
  );
}

export default Text;
