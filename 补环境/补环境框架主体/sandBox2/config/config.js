// 全局对象配置
debugger;

ldvm={
    "toolsFunc":{},// 功能函数相关,插件
    "envFunc":{},// 具体环境实现相关
    "config":{},// 配置相关
    "memory":{},// 内存
}
ldvm.config.proxy= true;// 是否开启代理

ldvm.config.print= true;// 是否输出日志

ldvm.memory.symbolProxy=Symbol("proxy");// 独一无二的属性

ldvm.memory.filterProxyProp = [ldvm.memory.symbolProxy,ldvm.memory.symbolData,Symbol.toPrimitive,Symbol.toStringTag,"eval"];// 需要过滤的属性

ldvm.memory.tag=[];// 内存,存储tag标签

ldvm.memory.symbolData = Symbol("data");// 用来保存当前对象上的原型属性

ldvm.memory.globalVar={};// 存储全局变量

ldvm.memory.globalVar.cookieJson={};//json格式的cookie

// ldvm.memory.globalVar.fontList=["SimHei","SimSun","NSimSun","FangSong","KaiTi"];// 浏览器能够识别的字体
//
// ldvm.memory.asyncEvent={};//异步事件
//
// ldvm.memory.globalVar.timeoutID=0;

// ldvm.memory.globalVar.all=new ldObj();



