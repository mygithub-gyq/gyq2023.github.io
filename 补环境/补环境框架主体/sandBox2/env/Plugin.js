// Plugin对象
Plugin = function Plugin(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(Plugin,"Plugin");
ldvm.toolsFunc.defineProperty(Plugin.prototype,"name",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Plugin.prototype,"Plugin","name_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Plugin.prototype,"filename",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Plugin.prototype,"Plugin","filename_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Plugin.prototype,"description",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Plugin.prototype,"Plugin","description_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Plugin.prototype,"length",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Plugin.prototype,"Plugin","length_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Plugin.prototype,"item",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Plugin.prototype,"Plugin","item",arguments)}});
ldvm.toolsFunc.defineProperty(Plugin.prototype,"namedItem",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Plugin.prototype,"Plugin","namedItem",arguments)}});