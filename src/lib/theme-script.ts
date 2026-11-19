export const THEME_KEY = "theme";

// Runs in <head> before the page paints: the visitor's saved light/dark choice, else the device setting.
export const themeScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}`;
