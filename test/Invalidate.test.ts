import assert from "assert"
import { describe, it } from "mocha"
import { Invalidate } from "../src"
import { Timeout } from "@jdframe/core"

describe("Delayed (Invalidate)", () => {
    it("Can be wiped", async () => {
        let i = 0
        const f = new Invalidate.Delayed.LazyValue(async () => i++)
        assert.equal(f.value, undefined)
        await new Timeout(0)
        assert.equal(f.value, undefined)
        await new Timeout(0)
        assert.equal(f.value, 0)
        f.value = undefined
        assert.equal(f.value, undefined)
        await new Timeout(0)
        assert.equal(f.value, 1)
    })
    it("Can be invalidated", async () => {
        let i = 0
        const f = new Invalidate.Delayed.LazyValue(async () => i++)
        assert.equal(f.value, undefined)
        await new Timeout(0)
        assert.equal(f.value, undefined)
        await new Timeout(0)
        assert.equal(f.value, 0)
        f.invalidate()
        assert.equal(f.value, 0)
        await new Timeout(0)
        assert.equal(f.value, 1)
    })
})