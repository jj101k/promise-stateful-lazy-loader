import * as PromiseStatefulLazyLoader from "./index"
if(typeof window != "undefined") {
    //@ts-ignore
    window["PromiseStatefulLazyLoader"] = PromiseStatefulLazyLoader
}