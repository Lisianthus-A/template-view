import styles from "./Header.module.scss";
import { useState, useContext, useEffect } from "react";
import Psd from "@webtoon/psd";
import { canvasRef } from "@/store";
import {
  Button,
  Icon,
  Modal,
  Tooltip,
  Select,
  Input,
  Toast,
} from "@/components";
import { CanvasDataContext } from "@/App";
import { addItem, editItem } from "@/utils/api";
import { ImageModel } from "@/models";
import EventBus from "@/utils/event";
import type { ChangeEvent } from "react";

const types = [
  {
    value: "template",
    text: "模板",
    tags: [
      {
        value: "推荐位",
        text: "推荐位",
      },
      {
        value: "海报",
        text: "海报",
      },
      {
        value: "内容",
        text: "内容",
      },
    ],
  },
  {
    value: "material",
    text: "素材",
    tags: [
      {
        value: "背景",
        text: "背景",
      },
      {
        value: "人物",
        text: "人物",
      },
      {
        value: "动物",
        text: "动物",
      },
      {
        value: "装饰",
        text: "装饰",
      },
      {
        value: "组合",
        text: "组合",
      },
    ],
  },
];

function Header() {
  const canvasData = useContext(CanvasDataContext);
  const [type, setType] = useState(
    types.find((item) => item.value === canvasData.type)!
  );
  const [tag, setTag] = useState(canvasData.tag);
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState(canvasData.name);

  const [stackStatus, setStackStatus] = useState({
    undo: false,
    redo: false,
  });

  const handleTypeChange = (value: string, item: any) => {
    if (item === type) {
      return;
    }

    setType(item);
    setTag(item.tags[0].value);
  };

  const handleSaveImage = async () => {
    if (!canvasRef.current) {
      return;
    }

    const base64String = await canvasRef.current.toImage();
    const a = document.createElement("a");
    a.href = base64String;
    a.download = `image-${Date.now()}.png`;
    a.click();
  };

  const handleSaveData = async () => {
    if (!canvasRef.current) {
      return;
    }

    const coverImage = await canvasRef.current.toImage();
    const json = canvasRef.current.toJson();

    const isAdd = canvasData.id === "" || canvasData.internal;
    let res: any;

    if (isAdd) {
      res = await addItem({
        name,
        tag,
        type: type.value,
        data: json,
        image: coverImage,
      });
      setTimeout(() => {
        location.replace(`${location.origin}?id=${res.data.id}`);
      }, 1000);
    } else {
      res = await editItem({
        id: canvasData.id,
        name,
        tag,
        type: type.value,
        data: json,
        image: coverImage,
      });
    }

    if (res.code === 0) {
      Toast.show("已保存");
    } else {
      Toast.show(res.text || "保存失败");
    }

    setVisible(false);
  };

  const handleNew = () => {
    location.replace(location.origin);
  };

  const handleFileChange = async (evt: ChangeEvent<HTMLInputElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const file = evt.target.files && evt.target.files[0];
    if (file === null) {
      return;
    }
    evt.target.value = "";

    if (!file.name.endsWith(".psd")) {
      return Toast.show("请选择正确的文件类型");
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = Psd.parse(arrayBuffer);
      const models = [];
      for (let i = result.layers.length - 1; i >= 0; --i) {
        const layer = result.layers[i];
        if (layer.isHidden) {
          console.log(`layer ${layer.name} isHidden`);
          continue;
        }
        if (layer.width > 5000 || layer.height > 5000) {
          Toast.show(`layer ${layer.name} 尺寸过大，已跳过`);
          console.log(`skip layer ${layer.name}`);
          continue;
        }
        const u8Array = await layer.composite(true, true);
        const imageData = new ImageData(u8Array, layer.width, layer.height);
        const model = await ImageModel.create({
          imageData,
          imageUrl: "",
          x: layer.left,
          y: layer.top,
        });
        models.push(model);
      }
      canvas.resize(result.width, result.height);
      models.forEach((model) => {
        canvas.add(model);
      });
    } catch (err) {
      Toast.show("psd 解析失败");
      console.log("catch psd error", err);
    }
  };

  const handleUndo = () => {
    if (!canvasRef.current || !stackStatus.undo) {
      return;
    }
    Toast.show("使用快捷键 Ctrl + Z 更方便哦~");

    canvasRef.current.undo();
  };

  const handleRedo = () => {
    if (!canvasRef.current || !stackStatus.redo) {
      return;
    }

    Toast.show("使用快捷键 Ctrl + Y 更方便哦~");
    canvasRef.current.redo();
  };

  useEffect(() => {
    EventBus.on("stack-status", setStackStatus);
    return () => {
      EventBus.off("stack-status", setStackStatus);
    };
  }, []);

  return (
    <div className={styles.header}>
      <div className="header-left">
        <div className="title">{canvasData.name}</div>

        <div className="divider" />

        <Tooltip
          className="icon-wrapper"
          text="撤销"
          style={stackStatus.undo ? undefined : { color: "#999" }}
          position="bottom"
          onClick={handleUndo}
        >
          <Icon type="icon-undo" />
        </Tooltip>
        <Tooltip
          className="icon-wrapper"
          style={stackStatus.redo ? undefined : { color: "#999" }}
          text="重做"
          position="bottom"
          onClick={handleRedo}
        >
          <Icon type="icon-redo" />
        </Tooltip>
        {canvasData.id !== "" && (
          <Button style={{ marginRight: 8 }} onClick={handleNew}>
            新建画布
          </Button>
        )}
      </div>
      <div className="header-right">
        <Button style={{ marginRight: 8 }}>
          从 psd 导入
          <input
            className="hide-input"
            type="file"
            accept=".psd"
            onChange={handleFileChange}
          />
        </Button>

        <Button style={{ marginRight: 8 }} onClick={handleSaveImage}>
          导出图片
        </Button>

        <Button type="primary" onClick={() => setVisible(true)}>
          保存
        </Button>
      </div>
      <Modal
        visible={visible}
        title="保存"
        onCancel={() => setVisible(false)}
        onOk={handleSaveData}
        className={styles["save-modal"]}
      >
        <div className="form-item">
          <div className="form-field">名称：</div>
          <Input value={name} onChange={setName} maxLength={64} />
        </div>
        <div className="form-item">
          <div className="form-field">类型：</div>
          <Select
            value={type.value}
            options={types}
            onChange={handleTypeChange}
          />
        </div>
        <div className="form-item">
          <div className="form-field">标签：</div>
          <Select
            options={type.tags}
            value={tag}
            onChange={(value) => setTag(value)}
          />
        </div>
      </Modal>
    </div>
  );
}

export default Header;
