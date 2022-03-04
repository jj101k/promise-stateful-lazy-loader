import { DelayedStatefulPromise } from "./DelayedStatefulPromise"
import { InactiveLazyValue } from "./InactiveLazyValue"
import { LazyValue } from "./LazyValue"

function InvalidateMixin<T, TBase extends {new(...args: any[]): LazyValue<T>}>(Base: TBase) {
    /**
     * This is a little more heavy than the counterpart basic class, and will
     * retain the old value while invalid.
     */
    return class extends Base {
        /**
         * This is true when the object has been invalidated
         */
        invalid = false

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
                if (value !== undefined) {
                    this.loadValue()
                }
            }
            return value
        }
        set value(v) {
            super.value = v
        }

        /**
         * This will mark the state as invalid, so that the loader will work again, but
         * it will keep the value in the meantime.
         */
        invalidate() {
            this.invalid = true
        }
    }
}

export const Invalidate = {
    DelayedStatefulPromise: InvalidateMixin(DelayedStatefulPromise),
    InactiveLazyValue: InvalidateMixin(InactiveLazyValue),
    LazyValue: InvalidateMixin(LazyValue),
}