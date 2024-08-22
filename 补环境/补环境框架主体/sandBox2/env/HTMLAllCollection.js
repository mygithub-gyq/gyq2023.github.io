// HTMLAllCollection对象
HTMLAllCollection = function HTMLAllCollection(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLAllCollection,"HTMLAllCollection");
ldvm.toolsFunc.defineProperty(HTMLAllCollection.prototype,"length",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLAllCollection.prototype,"HTMLAllCollection","length_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(HTMLAllCollection.prototype,"item",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLAllCollection.prototype,"HTMLAllCollection","item",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAllCollection.prototype,"namedItem",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLAllCollection.prototype,"HTMLAllCollection","namedItem",arguments)}});
ldvm.toolsFunc.defineProperty(HTMLAllCollection.prototype,"forEach",{configurable:true,enumerable:false, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,HTMLAllCollection.prototype,"HTMLAllCollection","forEach",arguments)}});