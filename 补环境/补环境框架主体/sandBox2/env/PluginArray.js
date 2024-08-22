// PluginArray对象
PluginArray = function PluginArray(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(PluginArray,"PluginArray");
ldvm.toolsFunc.defineProperty(PluginArray.prototype,"length",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,PluginArray.prototype,"PluginArray","length_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(PluginArray.prototype,"item",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,PluginArray.prototype,"PluginArray","item",arguments)}});
ldvm.toolsFunc.defineProperty(PluginArray.prototype,"namedItem",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,PluginArray.prototype,"PluginArray","namedItem",arguments)}});
ldvm.toolsFunc.defineProperty(PluginArray.prototype,"refresh",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,PluginArray.prototype,"PluginArray","refresh",arguments)}});