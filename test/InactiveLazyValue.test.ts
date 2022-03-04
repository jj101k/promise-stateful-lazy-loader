import assert from "assert"
import { describe, it } from "mocha"
import { InactiveLazyValue } from "../src"

describe("Lazy (inactive)", () => {
    describe("Delay tests", () => {
        it("Can be evaluated at a chosen time", async () => {
            const f = new InactiveLazyValue(() => "test")
            assert(f.value === undefined)
            await new Promise(resolve => setTimeout(resolve, 0))
            assert(f.value === undefined)
            f.activate()
            assert(f.value === "test")
        })
    })
})