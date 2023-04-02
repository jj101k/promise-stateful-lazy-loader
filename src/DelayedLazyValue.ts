import { InactiveLazyValue } from "./InactiveLazyValue"
import { Logger } from "./Utilities/Logger"
import { Timeout } from "@jdframe/core"

/**
 * This is an object with a "value" property to be lazy-loaded. The lazy-loading
 * functionality will be disabled for a defined time on startup - check the constructor.
 */
export class DelayedLazyValue<T> extends InactiveLazyValue<T> {
    /**
     * When to stop deferring. Null means at-next-opportunity.
     */
    private deferUntil?: Date | null

    /**
     * The value. While deferred or loading, this will be undefined.
     */
    get value() {
        const logger = Logger.inst
        logger.log("Getting")
        if(this.deferUntil !== undefined) {
            const deferUntil = this.deferUntil
            this.deferUntil = undefined
            if(deferUntil === null) {
                logger.log("0ms activate")
                new Timeout(0).then(() => this.activate())
            } else {
                const now = new Date()
                if(now < deferUntil) {
                    logger.log("later activate")
                    new Timeout(deferUntil.valueOf() - now.valueOf()).then(() => this.activate())
                } else {
                    logger.log("immediate activate")
                    this.activate()
                }
            }
        }
        return super.value
    }
    set value(v: T | undefined) {
        if(this.deferUntil !== undefined) {
            this.deferUntil = undefined
        }
        super.value = v
    }

    /**
     *
     * @param loader This will be called when .value is fetched
     * @param deferTime You've got some options here for when evaluation can happen:
     *  - <=0 (default): Not in the current context. This will actually enable
     *    evaluation 0ms after the next attempt to enumerate the value - this is
     *    so that users of Proxy can see the change. In practice that means it's
     *    two evaluation cycles after this constructor is called.
     *  - > 0: `n`ms later. Unlike `0` above, the first enumeration might be
     *    evaluated, if it's late enough.
     */
    constructor(loader: () => Promise<T> | T, deferTime: number = 0) {
        super(loader)
        if(deferTime <= 0) {
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