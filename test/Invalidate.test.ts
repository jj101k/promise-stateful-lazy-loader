import assert from "assert"
import { describe, it } from "mocha"
import { Invalidate } from ".."

describe("Delayed (Invalidate)", () => {
    it("Can be wiped", async () => {
        let i = 0
        const f = new Invalidate.DelayedStatefulPromise(async () => i++)
        assert.equal(f.value, undefined)
        await new Promise(resolve => setTimeout(resolve, 0))
        assert.equal(f.value, undefined)
        await new Promise(resolve => setTimeout(resolve, 0))
        assert.equal(f.value, 0)
        f.value = undefined
        assert.equal(f.value, undefined)
        await new Promise(resolve => setTimeout(resolve, 0))
        assert.equal(f.value, 1)
    })
    it("Can be invalidated", async () => {
        let i = 0
        const f = new Invalidate.DelayedStatefulPromise(async () => i++)
        assert.equal(f.value, undefined)
        await new Promise(resolve => setTimeout(resolve, 0))
        assert.equal(f.value, undefined)
        await new Promise(resolve => setTimeout(resolve, 0))
        assert.equal(f.value, 0)
        f.invalidate()
        assert.equal(f.value, 0)
        await new Promise(resolve => setTimeout(resolve, 0))
        assert.equal(f.value, 1)
    })
})