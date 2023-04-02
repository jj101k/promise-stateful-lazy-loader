/**
 * This is the set of lazy states for a prototype
 */
export interface LazyStateInfo<T> {
    /**
     * The prototype this applies to
     */
    prototype: T

    /**
     * The lazy state functions by property name
     */
    lazyStates: Map<string | number, () => Promise<any> | any>
}
