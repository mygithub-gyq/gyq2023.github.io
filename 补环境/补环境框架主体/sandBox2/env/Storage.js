// Storage对象
Storage = function Storage(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(Storage,"Storage");
ldvm.toolsFunc.defineProperty(Storage.prototype,"length",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","length_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Storage.prototype,"clear",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","clear",arguments)}});
ldvm.toolsFunc.defineProperty(Storage.prototype,"getItem",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","getItem",arguments)}});
ldvm.toolsFunc.defineProperty(Storage.prototype,"key",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","key",arguments)}});
ldvm.toolsFunc.defineProperty(Storage.prototype,"removeItem",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","removeItem",arguments)}});
ldvm.toolsFunc.defineProperty(Storage.prototype,"setItem",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","setItem",arguments)}});

// localStorage对象
localStorage = {}
Object.setPrototypeOf(localStorage,Storage.prototype);

// sessionStorage对象
sessionStorage = {}
Object.setPrototypeOf(sessionStorage,Storage.prototype);