import { Logger } from "./Logger"

/**
 * This tracks the state for a promise.
 */
export class StatefulPromise<T> {
    /**
     * This runs the loader, then stores the result in the state.
     *
     * @param state
     * @param loader
     */
    public static async callLoader<T>(state: StatefulPromise<T>, loader: () => Promise<T> | T) {
        const logger = Logger.inst
        logger.log("Calling function")
        const valueOrPromise = loader()
        logger.log("Got result", valueOrPromise)
        if (valueOrPromise && typeof valueOrPromise == "object" && "then" in valueOrPromise) {
            logger.log("It's async")
            state.value = await valueOrPromise
        } else {
            logger.log("It's not async")
            state.value = valueOrPromise
        }
        logger.log("Function called")
    }

    /**
     * Returns an immediately-triggered stateful promise.
     *
     * Where the returned value doesn't actually look like a promise, this will try
     * to skip the extra execution pass by assigning it directly.
     *
     * This doesn't perform any kind of cache lifetime management itself; if
     * you're using this for non-static data, you should really do something
     * like setTimeout(() => value = null, 300_000) after const {state} =
     * StatefulPromise.immediate(...).
     *
     * @param loader
     * @param id Set this to a unique value for cache control.
     * @returns
     */
    public static immediate<T>(loader: () => Promise<T> | T, id?: number) {
        const state = new StatefulPromise<T>(undefined, id)
        const promise = this.callLoader(state, loader)
        return {state, promise}
    }

    /**
     *
     * @param value
     * @param id Set this to a unique value for cache control.
     */
    constructor(public value?: T, public readonly id?: number) {
    }
}
