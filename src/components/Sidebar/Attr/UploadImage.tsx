import { Button } from "@/components";
import styles from "./UploadImage.module.scss";
import type { ChangeEvent } from "react";
import type { FormObject } from "@/models/CanvasModel";

type FormItem = FormObject["items"][number];

interface Props {
  item: FormItem;
}

function UploadImage({ item }: Props) {
  const { name, handler } = item;

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
      handler(base64String);
    };
  };

  return (
    <div className={styles["upload-image"]}>
      <Button className="button">
        {name}
        <input
          className="hide-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </Button>
    </div>
  );
}

export default UploadImage;
