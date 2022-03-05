import assert from "assert"
import { describe, it } from "mocha"
import { InactiveLazyValue } from "../src"

describe("Lazy (inactive)", () => {
    describe("Delay tests", () => {
        it("Can be evaluated at a chosen time", async () => {
            const f = new InactiveLazyValue(() => "test")
            assert.equal(f.value, undefined)
            await new Promise(resolve => setTimeout(resolve, 0))
            assert.equal(f.value, undefined)
            f.activate()
            assert.equal(f.value, "test")
        })
    })
})