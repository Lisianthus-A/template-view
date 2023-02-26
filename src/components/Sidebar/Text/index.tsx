import styles from "./index.module.scss";
import { fabric } from "fabric";
import { Button } from "@/components";
import { canvasRef } from "@/store";
import { TextModel } from "@/models";

function Text() {
  const handleAddText = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const text = await TextModel.create();
    canvas.add(text);
  };

  const handleAddArtText = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const font = new FontFace(
      "CangErShuYuanTi",
      "url(./fonts/CangErShuYuanTi.ttf)"
    );
    await font.load();
    document.fonts.add(font);

    const text = await TextModel.create({
      text: "今日\n爆单",
      fontSize: 30,
      width: 300,
      height: 365,
      fontFamily: "CangErShuYuanTi",
      color: "rgba(255, 255, 255, 1)",
      strokeColor: "#A63D13",
    });
    canvas.add(text);
  };

  const handleAddArtText2 = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const font = new FontFace(
      "AlimamaShuHeiTi",
      "url(./fonts/AlimamaShuHeiTi.ttf)"
    );
    await font.load();
    document.fonts.add(font);

    const text = await TextModel.create({
      text: "阿里妈妈数黑体",
      fontFamily: "AlimamaShuHeiTi",
    });
    canvas.add(text);
  };

  return (
    <div className={styles.text}>
      <Button style={{ width: "100%" }} onClick={handleAddText}>
        添加文本
      </Button>
      <div className="divider" />
      <Button onClick={handleAddArtText}>测试1</Button>
      <Button onClick={handleAddArtText2} style={{ marginLeft: 8 }}>
        测试2
      </Button>
    </div>
  );
}

export default Text;
