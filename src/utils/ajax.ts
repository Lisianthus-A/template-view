const serverUrl = import.meta.env.DEV ? "http://172.16.4.152:4500" : "";

interface AjaxRes<T = any> {
  code: number;
  text: string;
  data: T;
}

const ajaxGet = <T = any>(url: string): Promise<AjaxRes<T>> => {
  return fetch(serverUrl + url)
    .then((res) => res.json())
    .catch((err) => {
      console.log(`catch error when fetch url: ${url}`, err);
      return { code: 1, text: "网络异常" };
    });
};

const ajaxPost = <T = any>(
  url: string,
  data: Record<string, any>
): Promise<AjaxRes<T>> => {
  return fetch(serverUrl + url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .catch((err) => {
      console.log(`catch error when fetch url: ${url}`, err);
      return { code: 1, text: "网络异常" };
    });
};

export default {
  get: ajaxGet,
  post: ajaxPost,
};
