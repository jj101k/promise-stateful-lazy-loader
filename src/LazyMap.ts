import { BatchSendCondition, SelectionBuffer } from "@jdframe/selection-buffer"
import { StatefulPromise } from "./StatefulPromise"

/**
 * Allows you to take some action on a set of items after a fixed time, with
 * a shorter possible time before it is marked as not loadable.
 *
 * This is intended to handle cache entry expiry because that'll work a little
 * more efficiently if removing several at once, but it can safely be used for
 * other purposes.
 */
class LargeCacheExpiryControl<T> extends SelectionBuffer<T> {
    /**
     *
     */
    private loadable = true

    /**
     * Advisory only. You can use this to tell when to stop loading this object
     * and start loading a new one.
     */
    get isLoadable() {
        return this.loadable
    }

    /**
     * Builds the object.
     *
     * For cache expiry, you might go for t*1.5 for the complete-after time and
     * t*1 for the loadable-period value, meaning candidate items are always
     * expired between t*0.5 and t*1.5.
     *
     * @param sendCondition
     * @param loadablePeriodMs
     */
    constructor(sendCondition: BatchSendCondition<T>, loadablePeriodMs?: number) {
        super(sendCondition)
        if(loadablePeriodMs) {
            setTimeout(() => this.loadable = false, loadablePeriodMs)
        }
    }
}

/**
 * This gives you a map which isn't populated _yet_. When you access entries,
 * they will be loaded.
 *
 * This is useful for a pattern of loading several objects by their IDs if you
 * really don't know what there will be in advance.
 *
 * Typical usage:
 *
 * myProperty = new LazyMap<string, MyObject>((k) => fetch(`/objects/${k}`))
 */
export class LazyMap<K, V> implements Map<K, V> {
    private results = new Map<K, StatefulPromise<V>>()

    /**
     *
     */
    private timeouts: LargeCacheExpiryControl<K>[] = []

    /**
     *
     */
    private get activeTimeout() {
        if(this.timeoutMs === undefined) {
            return null
        }
        const currentTimeout = this.timeouts[0]
        if(currentTimeout?.isLoadable) {
            return currentTimeout
        } else {
            const newTimeout = new LargeCacheExpiryControl<K>(
                {timeoutMs: this.timeoutMs * 1.5}, this.timeoutMs)
            newTimeout.then(this.removeCacheEntries.bind(this))
            this.timeouts.unshift(newTimeout)
            return newTimeout
        }
    }

    /**
     * Removes the keys.
     *
     * As a cleanup pass, this will also drop any complete timeouts.
     *
     * @param keys
     */
    private removeCacheEntries(keys: K[]) {
        for(const key of keys) {
            this.results.delete(key)
        }
        this.timeouts = this.timeouts.filter(
            gct => gct.ready
        )
    }

    /**
     *
     * @param loader
     * @param timeoutMs
     */
    constructor(private loader: (k: K) => Promise<V> | V,
        private timeoutMs?: number
    ) {

    }

    get size() {
        return this.results.size
    }

    get [Symbol.toStringTag]() {
        return "LazyMap"
    }

    clear(): void {
        return this.results.clear()
    }
    delete(key: K): boolean {
        return this.results.delete(key)
    }
    *entries() {
        for(const entry of this.results.entries()) {
            const [k, v] = entry
            if(v.value !== undefined) {
                yield [k, v.value] as [K, V]
            }
        }
    }
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        return this.results.forEach((value, key) => {
            if(value.value !== undefined) {
                callbackfn(value.value, key, this)
            }
        })
    }
    get(key: K) {
        const result = this.results.get(key)
        if(result) {
            return result.value
        }
        const newResult = StatefulPromise.immediate(() => this.loader(key))
        this.results.set(key, newResult)
        this.activeTimeout?.add(key)
        return newResult.value
    }
    has(key: K): boolean {
        return this.results.has(key)
    }
    *keys(): IterableIterator<K> {
        return this.results.keys()
    }
    set(key: K, value: V): this {
        this.results.set(key, new StatefulPromise(value))
        return this
    }
    *values(): IterableIterator<V> {
        for(const value of this.results.values()) {
            if(value.value !== undefined) {
                yield value.value
            }
        }
    }
    [Symbol.iterator]() {
        return this.entries()
    }
}