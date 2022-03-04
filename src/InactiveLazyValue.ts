import { LazyValue } from "./LazyValue"
import { Logger } from "./Logger"

/**
 * This is an object with a "value" property to be lazy-loaded. The lazy-loading
 * functionality will be disabled initially.
 */
export class InactiveLazyValue<T> extends LazyValue<T> {
    /**
     * This is private in the Typescript sense so that it is enumerated by state
     * trackers.
     *
     * See .value
     */
    private deferred = true

    /**
     * The value. While deferred or loading, this will be undefined.
     */
    get value() {
        const logger = Logger.inst
        logger.log("Getting (defer?)")
        if(this.deferred) {
            logger.log("Deferred")
            return undefined
        } else {
            return super.value
        }
    }
    set value(v: T | undefined) {
        if(this.deferred) {
            this.deferred = false
        }
        super.value = v
    }

    /**
     * This will un-defer the object immediately.
     */
    activate() {
        this.deferred = false
    }
}