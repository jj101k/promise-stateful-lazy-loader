import { DelayedLazyValue } from "../DelayedLazyValue"

/**
 *
 */
export interface WithLazyStates {
    /**
     *
     */
    _lazy: { [propertyName: string]: DelayedLazyValue<any>}
}
