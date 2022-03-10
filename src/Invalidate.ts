import { DelayedLazyValue } from "./DelayedLazyValue"
import { InactiveLazyValue } from "./InactiveLazyValue"
import { InvalidateMixin } from "./InvalidateMixin"
import { LazyValue } from "./LazyValue"

export const Invalidate = {
    Delayed: {
        LazyValue: InvalidateMixin(DelayedLazyValue),
    },
    Inactive: {
        LazyValue: InvalidateMixin(InactiveLazyValue),
    },
    Immediate: {
        LazyValue: InvalidateMixin(LazyValue),
    },
}