import { DelayedStatefulPromise } from "./DelayedStatefulPromise"

/**
 * This is a little more heavy than DelayedStatefulPromise, and will
 * retain the old value while invalid.
 */

export class DelayedStatefulPromiseInvalidate<T> extends DelayedStatefulPromise<T> {
    /**
     * This is true when the object has been invalidated
     */
    private invalid = false

    /**
     * This loads the value (again).
     */
    private async loadValue() {
        this.state!.value = await this.loader()
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
