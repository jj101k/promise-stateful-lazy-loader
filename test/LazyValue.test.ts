import assert from "assert"
import { describe, it } from "mocha"
import { LazyValue } from "../"

describe("Lazy", () => {
    describe("Delay tests", () => {
        it("Can be evaluated immediately", async () => {
            const f = new LazyValue(() => "test")
            assert(f.value === "test")
        })
        it("Can be wiped", async () => {
            let i = 0
            const f = new LazyValue(async () => i++)
            assert(f.value === undefined)
            await new Promise(resolve => setTimeout(resolve, 0))
            assert(f.value === 0)
            f.value = undefined
            assert(f.value === undefined)
            await new Promise(resolve => setTimeout(resolve, 0))
            assert(f.value === 1)
        })
    })
})