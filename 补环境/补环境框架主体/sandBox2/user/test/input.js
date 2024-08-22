// 需要调试的代码

debugger;
// console.log(Date.now());
// console.log(new Date().getTime());
// console.log(Math.random());
//
// console.log(123,"134")

// 过代理器检测
// window={};
// self=window;
// top=window;
// parent=window;
//
// top=self=window=new Proxy(window,{});
//
// window=new Proxy(window,{});
// console.log(window===self);

// console.log(top===window);
// console.log(self===window);
// console.log(top.window===top);
//
// // 解决proxy代理失效
// document.createElement=document.createElement;
// console.log(document.createElement===document.createElement)

// a=document.createElement("div");
// a.xxx=1;
// a.align=123;

// function getTag(){
//     var metas=document.getElementsByTagName("meta");
//     var meta=metas[metas.length-1];
//     var value=meta.content;
//     meta.parentNode.removeChild(meta);
//     return atob(value+'NnYzNWalkyVnpjdz09');
// }
//
// var x=getTag();
// console.log(atob(x))

// document.write('<input type="hidden" id="test" name="inputTag" value="666">');
// function getValue(){
//     let tag=document.getElementById("test");
//     return `name: ${tag.name}, value:${tag.value}`;
// }

// console.log(getValue())

// document.cookie="aaaa";
// console.log(document.cookie);
// document.cookie="a=1";
// console.log(document.cookie);
// document.cookie="a=10";
// console.log(document.cookie);
// document.cookie="b=20";
// console.log(document.cookie);
// debugger;
// navigator.plugins.item(0);
// navigator.plugins.namedItem("Chrome PDF Viewer");
// debugger;