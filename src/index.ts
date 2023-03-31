import { DelayedLazyValue } from "./DelayedLazyValue"
import { InactiveLazyValue } from "./InactiveLazyValue"
import { InvalidateMixin } from "./InvalidateMixin"
import { LazyValue } from "./LazyValue"

export * from "./Decorator"
export const Delayed = {
    LazyValue: DelayedLazyValue,
}
export const Immediate = {
    LazyValue: LazyValue,
}
export const Inactive = {
    LazyValue: InactiveLazyValue,
}
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
export * from "./LazyMap"