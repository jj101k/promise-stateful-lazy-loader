import { Logger } from "./Logger"
import { StatefulPromise } from "./StatefulPromise"

/**
 * This is an object with a "value" property to be lazy-loaded.
 */
export class LazyValue<T> {
    /**
     * This is where the state for the promise goes. This is protected in the
     * Typescript sense so that it is enumerated by state trackers.
     */
    state?: StatefulPromise<T> = undefined

    /**
     * The value. While deferred, this will be undefined; likewise, while it's
     * loading, it'll still be deferred. After that it'll be T.
     *
     * You should avoid having T include undefined, because it'll be much harder
     * for you to track whether it's unloaded or loaded-but-undefined.
     *
     * Accessing the getter when not deferred will trigger the promise call.
     *
     * The setter will immediately store the value given and throw away the
     * promise state. If you set undefined, it will revert to an unloaded state.
     */
    get value() {
        const logger = Logger.inst
        logger.log("Getting (trigger)")
        if(!this.state) {
            logger.log("Adding state")
            this.state = StatefulPromise.immediate(this.loader)
        }
        return this.state.value
    }
    set value(v: T | undefined) {
        if(v === undefined) {
            this.state = undefined
        } else {
            this.state = new StatefulPromise(v)
        }
    }

    /**
     *
     * @param loader This will be called when .value is fetched
     */
    constructor(public loader: () => Promise<T> | T) {
    }
}