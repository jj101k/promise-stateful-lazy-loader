import assert from "assert"
import { describe, it } from "mocha"
import { DelayedStatefulPromiseInvalidate } from ".."

describe("File analyser tests", () => {
    it("Can be wiped", async () => {
        let i = 0
        const f = new DelayedStatefulPromiseInvalidate(async () => i++, null)
        assert(f.value === undefined)
        await new Promise(resolve => setTimeout(resolve, 0))
        assert(f.value === 0)
        f.value = undefined
        assert(f.value === undefined)
        await new Promise(resolve => setTimeout(resolve, 0))
        assert(f.value === 1)
    })
    it("Can be invalidated", async () => {
        let i = 0
        const f = new DelayedStatefulPromiseInvalidate(async () => i++, null)
        assert(f.value === undefined)
        await new Promise(resolve => setTimeout(resolve, 0))
        assert(f.value === 0)
        f.invalidate()
        assert(f.value === 0)
        await new Promise(resolve => setTimeout(resolve, 0))
        assert(f.value === 1)
    })
})