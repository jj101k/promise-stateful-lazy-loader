import { StatefulPromise } from "./StatefulPromise"

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
        if(this.timeoutMs) {
            setTimeout(() => this.results.delete(key), this.timeoutMs)
        }
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