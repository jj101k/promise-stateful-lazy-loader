import { Logger } from "./Logger"
import { StatefulPromise } from "./StatefulPromise"

/**
 * This is an object with a "value" property to be lazy-loaded. The lazy-loading
 * functionality will be disabled for a defined time on startup - check the constructor.
 */
export class DelayedStatefulPromise<T> {
    /**
     * This is private in the Javascript sense to prevent its enumeration by
     * state trackers, which would otherwise jump into action as soon as this
     * value changed.
     *
     * See .value
     */
    #deferred = true

    /**
     * This is where the state for the promise goes. This is private in the
     * Typescript sense so that it IS enumerated by state trackers.
     */
    protected state?: StatefulPromise<T> = undefined

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
        logger.log("Getting")
        if(this.#deferred) {
            logger.log("Deferred")
            return undefined
        }
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
     * @param deferTime By default, the getter will be deferred for 0ms so that
     * initial enumeration won't trigger it. If you need longer, you can set to
     * a higher value. If you need no deferment, set to -1. If you need
     * indefinite deferment, set to undefined and call .activate() later.
     */
    constructor(protected loader: () => Promise<T> | T, deferTime: number | null = 0) {
        if(deferTime === null) {
            this.activate()
        } else if(deferTime >= 0) {
            setTimeout(() => this.activate(), deferTime)
        }
    }

    /**
     * This will un-defer the object immediately.
     */
    activate() {
        this.#deferred = false
    }
}