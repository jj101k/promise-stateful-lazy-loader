import { Constructs } from "../Types/Constructs"
import { LazyValue } from "../LazyValue"
import { Logger } from "../Utilities/Logger"
import { WithInvalidate } from "../Types/WithInvalidate"

/**
 * Adds support for invalidating rather than rejecting
 */
export function InvalidateMixin<T, TBase extends Constructs<LazyValue<T>> >(Base: TBase): Constructs<LazyValue<T> & WithInvalidate> {
    return class extends Base implements WithInvalidate {
        /**
         * This is true when the object has been invalidated
         */
        private invalid = false

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
