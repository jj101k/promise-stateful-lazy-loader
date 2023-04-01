import { LazyValue } from "./LazyValue"
import { Logger } from "./Logger"
import { WithInvalidate } from "./WithInvalidate"

/**
 * Adds support for invalidating rather than rejecting
 */
export function InvalidateMixin<T, TBase extends { new(...args: any[]): LazyValue<T>} >(Base: TBase): {new(...args: any[]): LazyValue<T> & WithInvalidate} {
    /**
     * This is a little more heavy than the counterpart basic class, and will
     * retain the old value while invalid.
     */
    return class extends Base {
        /**
         * This is true when the object has been invalidated
         */
        private invalid = false

        /**
         * This loads the value (again).
         */
        async loadValue() {
            this.value = await this.loader()
        }

        get value() {
            const value = super.value
            if (this.invalid) {
                this.invalid = false
                const logger = Logger.inst.log("Invalidated - reload")
                if (value !== undefined) {
                    this.loadValue()
                }
            }
            return value
        }
        set value(v) {
            super.value = v
        }

        invalidate() {
            this.invalid = true
        }
    }
}
