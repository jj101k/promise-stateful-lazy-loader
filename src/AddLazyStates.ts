import { Constructs } from "./Constructs"
import { Decorator } from "./Decorator"
import { DelayedLazyValue } from "./DelayedLazyValue"
import { WithLazyStates } from "./WithLazyStates"

/**
 * Adds support for lazy states
 *
 * @param Base
 */
export function AddLazyStates<T, TBase extends Constructs<T> >(Base: TBase): Constructs<T & WithLazyStates> {
    const config = Decorator.lazyStateConfigurationFor(Base.prototype)

    Base.prototype._lazy = Object.fromEntries(
        [...config.lazyStates.entries()].map(([propertyName, f]) => {
            return [propertyName, new DelayedLazyValue(f)]
        })
    )

    return Base as Constructs<T & WithLazyStates>
}
