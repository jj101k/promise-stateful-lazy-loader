import assert from "assert"
import { describe, it } from "mocha"
import { Timeout } from "@jdframe/core"
import { Delayed } from "../src"

class SimpleClass {
    fooDelayed = new Delayed.LazyValue(() => "FIXME")
    barDelayed = new Delayed.LazyValue(async () => {
        await new Timeout(50)
        return 1
    })
    bazDelayed = new Delayed.LazyValue(async () => {
        await new Timeout(50)
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
                await new Timeout(0)
                assert.equal(o.foo, "FIXME")
            })
        })
        describe("Async values", () => {
            it("Can track a simple case (success)", async () => {
                await new Timeout(0)
                assert.equal(o.bar, undefined)
                await new Timeout(0)
                assert.equal(o.bar, undefined)
                await new Timeout(50)
                assert.equal(o.bar, 1)
            })
            it("Can track a simple case (failure)", async () => {
                await new Timeout(0)
                assert.equal(o.baz, undefined)
                await new Timeout(0)
                assert.equal(o.bar, undefined)
                await new Timeout(50)
                assert.equal(o.baz, undefined)
            })
        })
    })
    describe("Delay tests", () => {
        it("Is normally evaluated on the next loop", async () => {
            const f = new Delayed.LazyValue(() => "test")
            assert.equal(f.value, undefined)
            await new Timeout(0)
            assert.equal(f.value, "test")
        })
        it("Can be evaluated at a later time", async () => {
            const f = new Delayed.LazyValue(() => "test", 50)
            assert.equal(f.value, undefined)
            await new Timeout(0)
            assert.equal(f.value, undefined)
            await new Timeout(50)
            assert.equal(f.value, "test")
        })
    })
})