// EventTarget对象

EventTarget=function EventTarget(){

}
ldvm.toolsFunc.safeProto(EventTarget,"EventTarget");
ldvm.toolsFunc.defineProperty(EventTarget.prototype,"addEventListener",{
    value:function (){
        return ldvm.toolsFunc.dispatch(this,EventTarget.prototype,"EventTarget","addEventListener",arguments);
    }
});

