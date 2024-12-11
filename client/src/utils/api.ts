import { use } from "react";

const PRE_URL = process.env.NEXT_PUBLIC_APP_SERVER_URL;

export const Api = {
  // async get(url: string) {
  //   const res = await fetch(PRE_URL + url, { next: { revalidate: 3600 }, cache: 'no-cache' });
  //   const data = await res.json();
  //   return data?.data;
  // },
  async get(url: string) {
    console.log("get方法",url);
    const ignorePrevURI = ['https://', 'http://', '/api/'];
    const hasIgnorePrevURI = (url: string) => ignorePrevURI.some((s) => url.startsWith(s));
    const isFromOtherApi = hasIgnorePrevURI(url);
    const _url = isFromOtherApi ? url : PRE_URL + url;
    const res = await fetch(_url, {
      method: 'GET',
      next:{ revalidate: 0 },
      credentials:'include'
    });
    const data = await res.json();
    return data?.data;
  },
  async post(url: string, data: any = {},userId: string) { 
    console.log("Sending data",data);
    const res = await fetch(PRE_URL + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'userid':userId ,
      },
      body: JSON.stringify(data),
      next: { revalidate: 3600 },
      cache: 'no-cache'
    });
    console.log("Receive data",res);
    const dataJson = await res.json();
    console.log("dataJson data",dataJson);
    return dataJson?.data;
  },
};

export const useGet = (url: string) => {
    return use(Api.get(url))
};

export const usePost = (url:string,data:any = {}) => {
    return use(Api.post(url, data));
}

export const setCookie = (name, value, days) => {
  let expires = "";
  if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export const getCookie=(name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
} 