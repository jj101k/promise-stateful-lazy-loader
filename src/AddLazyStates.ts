import { Constructs } from "./Constructs"
import { DelayedLazyValue } from "./DelayedLazyValue"
import { LazyStateInfo } from "./LazyStateInfo"
import { WithLazyStates } from "./WithLazyStates"

/**
 * Adds support for lazy states
 *
 * @param Base
 */
export function AddLazyStates<T, TBase extends Constructs<T> >(Base: TBase, config: LazyStateInfo<T>): Constructs<T & WithLazyStates> {
    Base.prototype._lazy = Object.fromEntries(
        [...config.lazyStates.entries()].map(([propertyName, f]) => {
            return [propertyName, new DelayedLazyValue(f)]
        })
    )

    return Base as unknown as Constructs<T & WithLazyStates>
}
