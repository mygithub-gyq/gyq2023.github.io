// Event对象
Event = function Event(){return ldvm.toolsFunc.throwError("TypeError","Failed to construct 'Event': 1 argument required, but only 0 present.");}
ldvm.toolsFunc.safeProto(Event,"Event");
ldvm.toolsFunc.defineProperty(Event,"NONE",{configurable:false,enumerable:true, writable:false, value:0});
ldvm.toolsFunc.defineProperty(Event,"CAPTURING_PHASE",{configurable:false,enumerable:true, writable:false, value:1});
ldvm.toolsFunc.defineProperty(Event,"AT_TARGET",{configurable:false,enumerable:true, writable:false, value:2});
ldvm.toolsFunc.defineProperty(Event,"BUBBLING_PHASE",{configurable:false,enumerable:true, writable:false, value:3});
ldvm.toolsFunc.defineProperty(Event.prototype,"type",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","type_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Event.prototype,"target",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","target_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Event.prototype,"currentTarget",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","currentTarget_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Event.prototype,"eventPhase",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","eventPhase_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Event.prototype,"bubbles",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","bubbles_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Event.prototype,"cancelable",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","cancelable_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Event.prototype,"defaultPrevented",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","defaultPrevented_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Event.prototype,"composed",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","composed_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Event.prototype,"timeStamp",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","timeStamp_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Event.prototype,"srcElement",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","srcElement_get",arguments)}, set: undefined});
ldvm.toolsFunc.defineProperty(Event.prototype,"returnValue",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","returnValue_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","returnValue_set",arguments)}});
ldvm.toolsFunc.defineProperty(Event.prototype,"cancelBubble",{configurable:true,enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","cancelBubble_get",arguments)}, set: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","cancelBubble_set",arguments)}});
ldvm.toolsFunc.defineProperty(Event.prototype,"NONE",{configurable:false,enumerable:true, writable:false, value:0});
ldvm.toolsFunc.defineProperty(Event.prototype,"CAPTURING_PHASE",{configurable:false,enumerable:true, writable:false, value:1});
ldvm.toolsFunc.defineProperty(Event.prototype,"AT_TARGET",{configurable:false,enumerable:true, writable:false, value:2});
ldvm.toolsFunc.defineProperty(Event.prototype,"BUBBLING_PHASE",{configurable:false,enumerable:true, writable:false, value:3});
ldvm.toolsFunc.defineProperty(Event.prototype,"composedPath",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","composedPath",arguments)}});
ldvm.toolsFunc.defineProperty(Event.prototype,"initEvent",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","initEvent",arguments)}});
ldvm.toolsFunc.defineProperty(Event.prototype,"preventDefault",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","preventDefault",arguments)}});
ldvm.toolsFunc.defineProperty(Event.prototype,"stopImmediatePropagation",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","stopImmediatePropagation",arguments)}});
ldvm.toolsFunc.defineProperty(Event.prototype,"stopPropagation",{configurable:true,enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this,Event.prototype,"Event","stopPropagation",arguments)}});