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
     * Any active cache key collection to expire
     */
    private currentCacheExpiryHandler: LargeCacheExpiryControl<K> | null = null

    /**
     * A collection of cache keys to expire later
     */
    private get activeCacheExpiryHandler() {
        if(this.cacheTTLMs === undefined) {
            return null
        }
        if(this.currentCacheExpiryHandler?.isLoadable) {
            return this.currentCacheExpiryHandler
        } else {
            const newTimeout = new LargeCacheExpiryControl<K>(
                {timeoutMs: this.cacheTTLMs * 1.5}, this.cacheTTLMs)
            newTimeout.then(this.removeCacheEntries.bind(this))
            this.currentCacheExpiryHandler = newTimeout
            return newTimeout
        }
    }

    /**
     * Removes the keys.
     *
     * As a cleanup pass, this will also drop the current cache removal timeout
     * if it's complete.
     *
     * @param keys
     */
    private removeCacheEntries(keys: K[]) {
        for(const key of keys) {
            this.results.delete(key)
        }
        if(this.currentCacheExpiryHandler?.ready) {
            this.currentCacheExpiryHandler = null
        }
    }

    /**
     *
     * @param loader
     * @param cacheTTLMs
     */
    constructor(private loader: (k: K) => Promise<V> | V,
        private cacheTTLMs?: number
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
        let result = this.results.get(key)
        if(!result) {
            result = StatefulPromise.immediate(() => this.loader(key))
            this.results.set(key, result)
            this.activeCacheExpiryHandler?.add(key)
        }
        return result.value
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