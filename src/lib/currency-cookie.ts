export const CURRENCY_COOKIE = "cur";

// Runs in <head> before the page paints: shows prices in the currency chosen by cookie (set from the visitor's country).
export const currencyScript = `try{var m=document.cookie.match(/(?:^|; )${CURRENCY_COOKIE}=(RSD|EUR)/);document.documentElement.dataset.cur=m?m[1]:"RSD"}catch(e){}`;
