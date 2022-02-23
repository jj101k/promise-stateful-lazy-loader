import assert from "assert"
import { describe, it } from "mocha"
import { Decorator } from "../"

@Decorator.lazyStates()
class DecoratedClass {
    @Decorator.lazyState(() => "FIXME")
    foo!: string

    @Decorator.lazyState(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        return 1
    })
    bar!: number

    @Decorator.lazyState(async () => {
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