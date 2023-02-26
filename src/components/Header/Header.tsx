import styles from "./Header.module.scss";
import { canvasRef } from "@/store";
import { Button, Icon, Tooltip } from "@/components";

function Header() {
  const handleSaveImage = () => {
    if (!canvasRef.current) {
      return;
    }

    return canvasRef.current.toImage();
  };

  const handleSaveData = () => {
    if (!canvasRef.current) {
      return;
    }
    return canvasRef.current.toJson(true);
  };

  const handleUndo = () => {
    if (!canvasRef.current) {
      return;
    }

    canvasRef.current.undo();
  };

  const handleRedo = () => {
    if (!canvasRef.current) {
      return;
    }

    canvasRef.current.redo();
  };

  return (
    <div className={styles.header}>
      <div className="header-left">
        <div className="title">标题标题标题标题</div>

        <div className="divider" />

        <Tooltip
          className="icon-wrapper"
          text="撤销"
          position="bottom"
          onClick={handleUndo}
        >
          <Icon type="icon-undo" />
        </Tooltip>
        <Tooltip
          className="icon-wrapper"
          style={{ color: "#999" }}
          text="重做"
          position="bottom"
          onClick={handleRedo}
        >
          <Icon type="icon-redo" />
        </Tooltip>
      </div>
      <div className="header-right">
        <Button style={{ marginRight: 8 }} onClick={handleSaveImage}>
          导出图片
        </Button>

        <Button type="primary" onClick={handleSaveData}>
          保存数据
        </Button>
      </div>
    </div>
  );
}

export default Header;
