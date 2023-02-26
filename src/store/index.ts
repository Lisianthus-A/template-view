// import { atom } from "recoil";
// import { fabric } from "fabric";
import type { CanvasModel } from "@/models";

// export const canvasState = atom<fabric.Canvas | null>({
//   key: "",
//   default: null,
// });
interface CanvasRef {
  current: CanvasModel | null;
}
export const canvasRef: CanvasRef = {
  current: null,
};
