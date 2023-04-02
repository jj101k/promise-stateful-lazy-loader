import assert from "assert"
import { describe, it } from "mocha"
import { Timeout } from "@jdframe/core"
import { Immediate } from "../src"

describe("Lazy", () => {
    describe("Delay tests", () => {
        it("Can be evaluated immediately", async () => {
            const f = new Immediate.LazyValue(() => "test")
            assert.equal(f.value, "test")
        })
        it("Can be wiped", async () => {
            let i = 0
            const f = new Immediate.LazyValue(async () => i++)
            assert.equal(f.value, undefined)
            await new Timeout(0)
            assert.equal(f.value, 0)
            f.value = undefined
            assert.equal(f.value, undefined)
            await new Timeout(0)
            assert.equal(f.value, 1)
        })
    })
})