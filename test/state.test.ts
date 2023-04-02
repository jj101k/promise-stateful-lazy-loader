import assert from "assert"
import { describe, it } from "mocha"
import { DelayedLazyValue } from "../src/DelayedLazyValue"
import { Timeout } from "@jdframe/core"

describe("State tracking", () => {
    describe("observe", () => {
        /**
         * This does roughly what state tracking frameworks do.
         *
         * @param o
         */
        function observe(o: any) {
            const original: {[k: string]: any} = {}
            const sets: any[] = []
            for(const k in o) {
                if(Object.getOwnPropertyDescriptor(o, k)?.get) {
                    continue
                }
                original[k] = o[k]
                if(o[k] instanceof Object) {
                    observe(o[k])
                }
                Object.defineProperty(
                    o,
                    k,
                    {
                        get() {
                            return this._original[k]
                        },
                        set(v) {
                            this._sets.push([k, v])
                            this._original[k] = v
                            if(v instanceof Object) {
                                observe(v)
                            }
                        }
                    }
                )
            }
            o._original = original
            o._sets = sets

            o.getSets = function() {
                const sets = [...this._sets]
                for(const [k, v] of Object.entries(this._original)) {
                    if(v && typeof v == "object" && "getSets" in v) {
                        const ov = v as {getSets(): [string, any][]}
                        sets.push(...ov.getSets().map(([ki, vi]) => [`${k}.${ki}`, vi]))
                    }
                }
                return sets
            }
            o.clearSets = function() {
                this._sets = []
                for(const v of Object.values(this._original)) {
                    if(v && typeof v == "object" && "clearSets" in v) {
                        const ov = v as {clearSets(): void}
                        ov.clearSets()
                    }
                }
            }
        }
        it("Can track a simple case", async () => {
            const o = {
                fooDelayed: new DelayedLazyValue(() => "FIXME"),
                get foo() {
                    return this.fooDelayed.value
                },
            }
            observe(o)
            assert.equal(o.foo, undefined, "Initially no value")
            await new Timeout(0)
            // We actually just look for any change.
            assert.equal(o.foo, "FIXME", "Value is eventually set")
        })
    })
    describe("proxy", () => {
        class Handler {
            sets: any[] = []
            get(target: any, n: string, receiver: any): any {
                let i: PropertyDescriptor | undefined = undefined
                let o = target
                while(o && !i) {
                    i = Object.getOwnPropertyDescriptor(
                        o,
                        n
                    )
                    o = Object.getPrototypeOf(o)
                }
                let value
                if(i?.get) {
                    value = i.get.call(receiver)
                } else {
                    value = target[n]
                }
                if(value instanceof Object) {
                    return new Proxy(value, this)
                } else {
                    return value
                }
            }
            set(target: any, n: string, v: any) {
                this.sets.push([target, n])
                target[n] = v
                return true
            }

            clearSets() {
                this.sets = []
            }
            getSets() {
                return this.sets
            }
        }
        it("Can track a simple case", async () => {
            const o = {
                fooDelayed: new DelayedLazyValue(() => "FIXME"),
                get foo() {
                    return this.fooDelayed.value
                },
            }
            const handler = new Handler()
            const ob = new Proxy(o, handler)

            assert.equal(ob.foo, undefined, "Initially no value")
            await new Timeout(0)
            // We actually just look for any change.
            assert.equal(ob.foo, "FIXME", "Value is eventually set")
        })
    })
})