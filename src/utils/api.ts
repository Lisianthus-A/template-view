import ajax from "./ajax";

export const getItems = <T = any>() => {
  return ajax.get<T>("/api/items/search");
};

export const getItemById = (id: string) => {
  return ajax.get(`/api/items/detail?id=${id}`);
};

export const getMyItems = () => {
  return ajax.get("/api/my/search");
};

export const addItem = (data: any) => {
  // return ajax.post("/api/items/add-internal", data);
  return ajax.post("/api/items/add", data);
};

export const editItem = (data: any) => {
  return ajax.post("/api/items/edit", data);
};

export const deleteItem = (id: string) => {
  return ajax.post("/api/items/delete", { id });
};

export const addFavorite = (id: string) => {
  return ajax.post("/api/favorite/add", { id });
};

export const deleteFavorite = (id: string) => {
  return ajax.post("/api/favorite/delete", { id });
};

export const addShared = (id: string) => {
  return ajax.post("/api/shared/add", { id });
};

export const deleteShared = (id: string) => {
  return ajax.post("/api/shared/delete", { id });
};
