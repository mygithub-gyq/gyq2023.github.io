// UIEvent对象
UIEvent = function UIEvent(){return ldvm.toolsFunc.throwError("TypeError","Failed to construct 'UIEvent': 1 argument required, but only 0 present.");}
ldvm.toolsFunc.safeProto(UIEvent,"UIEvent");
Object.setPrototypeOf(UIEvent.prototype,Event.prototype);
ldvm.toolsFunc.defineProperty(UIEvent.prototype,"view",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,UIEvent.prototype,"UIEvent","view_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(UIEvent.prototype,"detail",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,UIEvent.prototype,"UIEvent","detail_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(UIEvent.prototype,"sourceCapabilities",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,UIEvent.prototype,"UIEvent","sourceCapabilities_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(UIEvent.prototype,"which",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,UIEvent.prototype,"UIEvent","which_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(UIEvent.prototype,"initUIEvent",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,UIEvent.prototype,"UIEvent","initUIEvent",arguments)}});