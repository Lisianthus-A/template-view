import styles from "./index.module.scss";
import { ChangeEvent, useState } from "react";
import { canvasRef } from "@/store";
import { Button, Collection } from "@/components";
import { ImageModel } from "@/models";

function Material() {
  const [loading, setLoading] = useState(false);

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
    if (loading) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    setLoading(true);

    const model = await ImageModel.create({
      imageUrl: url,
    });
    canvas.add(model);
    setLoading(false);
  };

  return (
    <div className={styles.material}>
      <Button style={{ width: "100%" }} loading={loading}>
        添加本地图片
        <input
          className="hide-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </Button>
      <div className="divider" />
      <Collection type="material" />
    </div>
  );
}

export default Material;
