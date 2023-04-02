import { DelayedLazyValue } from "./DelayedLazyValue"
import { InactiveLazyValue } from "./InactiveLazyValue"
import { InvalidateMixin } from "./Mixins/InvalidateMixin"
import { LazyValue } from "./LazyValue"

export const Delayed = {
    LazyValue: DelayedLazyValue,
}
export const Immediate = {
    LazyValue,
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
export * from "./PSLazy"