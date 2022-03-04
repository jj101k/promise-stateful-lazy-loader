import assert from "assert"
import { describe, it } from "mocha"
import { DelayedStatefulPromise } from "../"
import { LazyValue } from "../src"

class SimpleClass {
    fooDelayed = new DelayedStatefulPromise(() => "FIXME")
    barDelayed = new DelayedStatefulPromise(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return 1
    })
    bazDelayed = new DelayedStatefulPromise(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        throw new Error("Failed")
    })

    get foo() {
        return this.fooDelayed.value
    }

    get bar() {
        return this.barDelayed.value
    }

    get baz() {
        return this.bazDelayed.value
    }
}

describe("Delayed", () => {
    describe("On a class", () => {
        let o: SimpleClass
        beforeEach(() => o = new SimpleClass())
        describe("Immediate values", () => {
            it("Can track a simple case", async () => {
                await new Promise(resolve => setTimeout(resolve, 0))
                assert(o.foo == "FIXME")
            })
        })
        describe("Async values", () => {
            it("Can track a simple case (success)", async () => {
                await new Promise(resolve => setTimeout(resolve, 0))
                assert(o.bar === undefined)
                await new Promise(resolve => setTimeout(resolve, 50))
                assert(o.bar == 1)
            })
            it("Can track a simple case (failure)", async () => {
                await new Promise(resolve => setTimeout(resolve, 0))
                assert(o.baz === undefined)
                await new Promise(resolve => setTimeout(resolve, 50))
                assert(o.baz == undefined)
            })
        })
    })
    describe("Delay tests", () => {
        it("Is normally evaluated on the next loop", async () => {
            const f = new DelayedStatefulPromise(() => "test")
            assert(f.value === undefined)
            await new Promise(resolve => setTimeout(resolve, 0))
            assert(f.value === "test")
        })
        it("Can be evaluated at a later time", async () => {
            const f = new DelayedStatefulPromise(() => "test", 50)
            assert(f.value === undefined)
            await new Promise(resolve => setTimeout(resolve, 0))
            assert(f.value === undefined)
            await new Promise(resolve => setTimeout(resolve, 50))
            assert(f.value === "test")
        })
        it("Can be evaluated at a chosen time", async () => {
            const f = new DelayedStatefulPromise(() => "test", -1)
            assert(f.value === undefined)
            await new Promise(resolve => setTimeout(resolve, 0))
            assert(f.value === undefined)
            f.activate()
            assert(f.value === "test")
        })
    })
})