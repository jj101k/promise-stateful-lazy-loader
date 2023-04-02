import assert from "assert"
import { describe, it } from "mocha"
import { InactiveLazyValue } from "../src/InactiveLazyValue"
import { Timeout } from "@jdframe/core"

describe("Lazy (inactive)", () => {
    describe("Delay tests", () => {
        it("Can be evaluated at a chosen time", async () => {
            const f = new InactiveLazyValue(() => "test")
            assert.equal(f.value, undefined)
            await new Timeout(0)
            assert.equal(f.value, undefined)
            f.activate()
            assert.equal(f.value, "test")
        })
    })
})