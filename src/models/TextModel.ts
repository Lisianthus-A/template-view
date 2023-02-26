import { fabric } from "fabric";
import { canvasRef } from "@/store";
import EventBus from "@/utils/event";
import BaseModel from "./BaseModel";

interface Config {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  color?: string;
  strokeColor?: string;
  underline?: boolean;
  linethrough?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  angle?: number;
}

const defaultConfig = {
  text: "Text",
  fontSize: 40,
  fontFamily: "Times New Roman",
  fontWeight: "normal",
  fontStyle: "normal",
  color: "rgba(0, 0, 0, 1)",
  strokeColor: "",
  underline: false,
  linethrough: false,
  x: 100,
  y: 100,
  width: 0,
  height: 0,
  angle: 0,
};

class TextModel extends BaseModel {
  config: Required<Config>;
  instance: fabric.IText;

  constructor(
    instance: fabric.IText,
    config: Required<Config> & { originWidth: number; originHeight: number }
  ) {
    super(instance, config);
    this.instance = instance;
    this.config = config;

    this.setText = this.setText.bind(this);
    this.setFontFamily = this.setFontFamily.bind(this);
    this.setFontSize = this.setFontSize.bind(this);
    this.setColor = this.setColor.bind(this);
    this.setStrokeColor = this.setStrokeColor.bind(this);
    this.fontStyleHandler = this.fontStyleHandler.bind(this);
    this.updateTextConfig = this.updateTextConfig.bind(this);
    this.instance.on("editing:exited", this.updateTextConfig);
    this.instance.on("changed", this.updateTextConfig);
    console.log("text", this);
  }

  static create(_config?: Config) {
    return new Promise<TextModel>((resolve) => {
      const config = Object.assign(
        { originWidth: 0, originHeight: 0 },
        defaultConfig,
        _config
      );
      const text = new fabric.IText(config.text, {
        left: config.x,
        top: config.y,
        angle: config.angle,
        fill: config.color,
        stroke: config.strokeColor,
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        fontWeight: config.fontWeight,
      });
      if (config.width === 0) {
        config.width = text.width || 0;
      }
      if (config.height === 0) {
        config.height = text.height || 0;
      }
      config.originWidth = text.width || 0;
      config.originHeight = text.height || 0;
      const model = new TextModel(text, config);
      resolve(model);
    });
  }

  private updateTextConfig() {
    const {
      text = "",
      width = 0,
      height = 0,
      scaleX = 1,
      scaleY = 1,
    } = this.instance;

    this.originWidth = width;
    this.originHeight = height;
    this.config.width = width * scaleX;
    this.config.height = height * scaleY;
    this.config.text = text;
    EventBus.emit("update-config");
  }

  // 设置文本内容
  setText(text: string) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    this.config.text = text;
    this.instance.set("text", text);

    this.updateTextConfig();
    canvas.render();
  }

  // 设置字体
  setFontFamily(fontFamily: string) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    this.config.fontFamily = fontFamily;
    this.instance.set("fontFamily", fontFamily);

    this.updateTextConfig();
    canvas.render();
  }

  // 设置颜色
  setColor(color: string) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    this.config.color = color;
    this.instance.set("fill", color);

    this.updateTextConfig();
    canvas.render();
  }

  // 设置描边颜色
  setStrokeColor(color: string) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    this.config.strokeColor = color;
    this.instance.set("stroke", color);

    this.updateTextConfig();
    canvas.render();
  }

  // 设置文本大小
  setFontSize(size: number) {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    this.config.fontSize = size;
    this.instance.set("fontSize", size);

    this.updateTextConfig();
    canvas.render();

    this.instance.set("italic");
  }

  // 设置字体各种样式
  fontStyleHandler(iconType: string) {
    if (iconType === "icon-bold") {
      this.toggleFontWeight();
    } else if (iconType === "icon-italic") {
      this.toggleItalic();
    } else if (iconType === "icon-underline") {
      this.toggleUnderline();
    } else if (iconType === "icon-linethrough") {
      this.toggleLinethrough();
    }
  }

  // 设置自重 normal | bold
  toggleFontWeight() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    if (this.config.fontWeight === "normal") {
      this.config.fontWeight = "bold";
      this.instance.set("fontWeight", "bold");
    } else {
      this.config.fontWeight = "normal";
      this.instance.set("fontWeight", "normal");
    }

    this.updateTextConfig();
    canvas.render();
  }

  // 设置斜体 normal | italic
  toggleItalic() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    if (this.config.fontStyle === "normal") {
      this.config.fontStyle = "italic";
      this.instance.set("fontStyle", "italic");
    } else {
      this.config.fontStyle = "normal";
      this.instance.set("fontStyle", "normal");
    }

    this.updateTextConfig();
    canvas.render();
  }

  // 下划线
  toggleUnderline() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    this.config.underline = !this.config.underline;
    this.instance.set("underline", this.config.underline);

    this.updateTextConfig();
    canvas.render();
  }

  // 设置删除线
  toggleLinethrough() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    this.config.linethrough = !this.config.linethrough;
    this.instance.set("linethrough", this.config.linethrough);

    this.updateTextConfig();
    canvas.render();
  }

  getFormObject() {
    const baseItems = this.getBaseFormItems();
    const { fontWeight, fontStyle, underline, linethrough } = this.config;

    return {
      id: this.id,
      name: "文本",
      items: [
        {
          id: `${this.id}-text`,
          type: "textarea",
          name: "内容",
          value: this.config.text,
          handler: this.setText,
        },
        {
          id: `${this.id}-fontFamily`,
          type: "select",
          name: "字体",
          value: "",
          handler: () => {},
        },
        {
          id: `${this.id}-color`,
          type: "color",
          name: "颜色",
          value: this.config.color,
          handler: this.setColor,
        },
        {
          id: `${this.id}-strokeColor`,
          type: "color",
          name: "描边颜色",
          value: this.config.strokeColor,
          handler: this.setStrokeColor,
        },
        {
          id: `${this.id}-fontSize`,
          type: "range",
          name: "字体大小",
          max: 200,
          value: this.config.fontSize,
          handler: this.setFontSize,
        },
        {
          id: `${this.id}-fontStyle`,
          type: "icon-bar",
          name: "字体样式",
          iconTypes: [
            "icon-bold",
            "icon-italic",
            "icon-underline",
            "icon-linethrough",
          ],
          labels: ["加粗", "斜体", "下划线", "删除线"],
          value: [
            fontWeight === "bold",
            fontStyle === "italic",
            underline,
            linethrough,
          ],
          handler: this.fontStyleHandler,
        },
        ...baseItems,
      ],
    };
  }

  getData() {
    return {
      type: "text",
      zIndex: this.zIndex,
      config: this.config,
    };
  }
}

export default TextModel;
