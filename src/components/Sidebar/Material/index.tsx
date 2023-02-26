import styles from "./index.module.scss";
import { canvasRef } from "@/store";
import { Button } from "@/components";
import { ImageModel } from "@/models";
import type { ChangeEvent } from "react";

function Material() {
  const handleFileChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files && evt.target.files[0];
    if (file === null) {
      return;
    }
    evt.target.value = "";

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (evt) => {
      const base64String = evt.target!.result as string;
      addImageModel(base64String);
    };
  };

  const addImageModel = async (url: string) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const model = await ImageModel.create({
      imageUrl: url,
      x: 100,
      y: 100,
    });
    canvas.add(model);
  };

  return (
    <div className={styles.material}>
      <Button style={{ width: "100%" }}>
        添加本地图片
        <input
          className="hide-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </Button>
      <div className="divider" />
      <div>Todo: 其他内置图片</div>
    </div>
  );
}

export default Material;
