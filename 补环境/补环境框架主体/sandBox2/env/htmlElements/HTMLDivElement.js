// HTMLDivElement对象
HTMLDivElement = function HTMLDivElement(){return ldvm.toolsFunc.throwError("TypeError","Illegal constructor");}
ldvm.toolsFunc.safeProto(HTMLDivElement,"HTMLDivElement");
Object.setPrototypeOf(HTMLDivElement.prototype,HTMLElement.prototype);
ldvm.toolsFunc.defineProperty(HTMLDivElement.prototype,"align",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,HTMLDivElement.prototype,"HTMLDivElement","align_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,HTMLDivElement.prototype,"HTMLDivElement","align_set",arguments)}});