import assert from "assert"
import { describe, it } from "mocha"
import { DelayedLazyValue } from "../src/DelayedLazyValue"

class SimpleClass {
    fooDelayed = new DelayedLazyValue(() => "FIXME")
    barDelayed = new DelayedLazyValue(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return 1
    })
    bazDelayed = new DelayedLazyValue(async () => {
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
                assert.equal(o.foo, undefined)
                await new Promise(resolve => setTimeout(resolve, 0))
                assert.equal(o.foo, "FIXME")
            })
        })
        describe("Async values", () => {
            it("Can track a simple case (success)", async () => {
                await new Promise(resolve => setTimeout(resolve, 0))
                assert.equal(o.bar, undefined)
                await new Promise(resolve => setTimeout(resolve, 0))
                assert.equal(o.bar, undefined)
                await new Promise(resolve => setTimeout(resolve, 50))
                assert.equal(o.bar, 1)
            })
            it("Can track a simple case (failure)", async () => {
                await new Promise(resolve => setTimeout(resolve, 0))
                assert.equal(o.baz, undefined)
                await new Promise(resolve => setTimeout(resolve, 0))
                assert.equal(o.bar, undefined)
                await new Promise(resolve => setTimeout(resolve, 50))
                assert.equal(o.baz, undefined)
            })
        })
    })
    describe("Delay tests", () => {
        it("Is normally evaluated on the next loop", async () => {
            const f = new DelayedLazyValue(() => "test")
            assert.equal(f.value, undefined)
            await new Promise(resolve => setTimeout(resolve, 0))
            assert.equal(f.value, "test")
        })
        it("Can be evaluated at a later time", async () => {
            const f = new DelayedLazyValue(() => "test", 50)
            assert.equal(f.value, undefined)
            await new Promise(resolve => setTimeout(resolve, 0))
            assert.equal(f.value, undefined)
            await new Promise(resolve => setTimeout(resolve, 50))
            assert.equal(f.value, "test")
        })
    })
})