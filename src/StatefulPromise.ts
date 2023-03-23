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
        if (typeof valueOrPromise == "object" && "then" in valueOrPromise) {
            logger.log("It's async")
            try {
                state.value = await valueOrPromise
            } catch (e) {
                console.error(e)
            }
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
     * @param loader
     * @returns
     */
    public static immediate<T>(loader: () => Promise<T> | T) {
        const state = new StatefulPromise<T>()
        this.callLoader(state, loader)
        return state
    }

    /**
     *
     * @param value
     */
    constructor(public value?: T) {
    }
}
