import { Logger } from "./Logger"
import { StatefulPromise } from "./StatefulPromise"

/**
 * This is an object with a "value" property to be lazy-loaded. The lazy-loading
 * functionality will be disabled for a defined time on startup - check the constructor.
 */
export class DelayedStatefulPromise<T> {
    /**
     * When to stop deferring. Null means at-next-opportunity.
     */
    private deferUntil?: Date | null

    /**
     * This is private in the Typescript sense so that it is enumerated by state
     * trackers.
     *
     * See .value
     */
    private deferred = true

    /**
     * This is where the state for the promise goes. This is protected in the
     * Typescript sense so that it is enumerated by state trackers.
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
        if(!this.state) {
            if(this.deferUntil !== undefined) {
                const deferUntil = this.deferUntil
                this.deferUntil = undefined
                if(deferUntil === null) {
                    logger.log("0ms activate")
                    setTimeout(() => this.activate(), 0)
                } else {
                    const now = new Date()
                    if(now > deferUntil) {
                        logger.log("later activate")
                        setTimeout(() => this.activate(), deferUntil.valueOf() - now.valueOf())
                    } else {
                        logger.log("immediate activate")
                        this.deferred = false
                    }
                }
            }
            if(this.deferred) {
                logger.log("Deferred")
                return undefined
            } else {
                logger.log("Adding state")
                this.state = StatefulPromise.immediate(this.loader)
            }
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
     * @param deferTime You've got some options here for when evaluation can happen:
     *  - < 0: Immediately.
     *  - 0 (default): Not in the current context. This will actually enable
     *    evaluation 0ms after the next attempt to enumerate the value - this is
     *    so that users of Proxy can see the change
     *  - > 0: `n`ms later. Unlike `0` above, the first enumeration might be
     *    evaluated, if it's late enough.
     *  - null: Not until `activate()` is called
     */
    constructor(protected loader: () => Promise<T> | T, deferTime: number | null = 0) {
        if(deferTime !== null) {
            if(deferTime < 0) {
                this.activate()
            } else if(deferTime == 0) {
                this.deferUntil = null
            } else {
                const deferUntil = new Date()
                deferUntil.setMilliseconds(
                    deferUntil.getMilliseconds() + deferTime
                )
                this.deferUntil = deferUntil
            }
        }
    }

    /**
     * This will un-defer the object immediately.
     */
    activate() {
        this.deferred = false
    }
}