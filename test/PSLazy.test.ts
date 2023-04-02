import assert from "assert"
import { describe, it } from "mocha"
import { PSLazy } from ".."

@PSLazy.lazyStates
class DecoratedClass {
    @PSLazy.lazyState(() => "FIXME")
    foo!: string

    @PSLazy.lazyState(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return 1
    })
    bar!: number

    @PSLazy.lazyState(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        throw new Error("Failed")
    })
    baz!: number
}

describe("Decorators", () => {
    let o: DecoratedClass
    beforeEach(() => o = new DecoratedClass())
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
            assert.equal(o.bar, undefined)
            await new Promise(resolve => setTimeout(resolve, 0))
            const b = o.baz
            assert.equal(b, undefined)
            await new Promise(resolve => setTimeout(resolve, 50))
            assert.equal(o.baz, undefined)
        })
    })
})