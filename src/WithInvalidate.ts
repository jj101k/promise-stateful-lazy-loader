/**
 * This is a little more heavy than the counterpart basic class, and will
 * retain the old value while invalid.
 */
export interface WithInvalidate {
    /**
     * This will mark the state as invalid, so that the loader will work again, but
     * it will keep the value in the meantime.
     */
    invalidate(): void

    /**
     * This loads the value (again).
     */
    loadValue(): Promise<void>
}
