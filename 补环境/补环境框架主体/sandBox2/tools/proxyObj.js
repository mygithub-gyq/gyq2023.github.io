// 需要代理的对象

// window = new Proxy(window,{});
localStorage=ldvm.toolsFunc.proxy(localStorage,"localStorge");
sessionStorage=ldvm.toolsFunc.proxy(sessionStorage,"sessionStorage");
location=ldvm.toolsFunc.proxy(location,"location");
navigator=ldvm.toolsFunc.proxy(navigator,"navigator");
document=ldvm.toolsFunc.proxy(document,"document");
window=ldvm.toolsFunc.proxy(window,"window");

