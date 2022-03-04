import assert from "assert"
import { describe, it } from "mocha"
import { DelayedStatefulPromise } from ".."

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
                if(typeof o[k] == "object") {
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
                            if(typeof v == "object") {
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
                fooDelayed: new DelayedStatefulPromise(() => "FIXME"),
                get foo() {
                    return this.fooDelayed.value
                },
            }
            observe(o)
            const ob = o as unknown as {getSets(): any[], clearSets(): void}
            assert(ob.getSets().length == 0, "Initially no sets")
            ob.clearSets()
            assert(o.foo === undefined, "Initially no value")
            assert(ob.getSets().length == 0, "No sets on first evaluation")
            ob.clearSets()
            await new Promise(resolve => setTimeout(resolve, 0))
            // We actually just look for any change.
            assert(ob.getSets().length > 0, "Some sets after first evaluation")
            ob.clearSets()
            assert(o.foo == "FIXME", "Value is eventually set")
            assert(ob.getSets().length > 0, "Some sets after successful evaluation")
        })
    })
})