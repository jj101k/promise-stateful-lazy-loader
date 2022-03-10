# promise-stateful-lazy-loader

## Overview

This is a package built to make it easier to work with promises and, more
generally, fetch()-like interfaces, in code which tracks state. In particular,
that means reactive UI frameworks like Vue, React etc.

This does assume that the result will be meaningful forever; if not, you should
clear it later.

## Summary

The main ways to use this functionality are this:

```js
import {Delayed} from "promise-stateful-lazy-loader"
class Foo {
    barDelayed = new Delayed.LazyValue(() => fetch("/bar"))
    get bar() {
        return this.barDelayed.value
    }
}
```

...or, if _experimental decorators_ are your thing, this:

```js
import {Decorator} from "promise-stateful-lazy-loader"

@Decorator.lazyStates()
class DecoratedClass {
    @Decorator.lazyState(() => fetch("/bar"))
    bar!: string
}
```

In both cases you get a value which will first be a candidate for being fetched
immediately after the current execution context finishes, which means it'll be
loaded when it's actually used properly.

## Different Styles

### Decorator

```js
import {Decorator} from "promise-stateful-lazy-loader"

@Decorator.lazyStates()
class DecoratedClass {
    @Decorator.lazyState(() => fetch("/bar"))
    bar!: string
}
```

This saves you having to write your own wrapper, but otherwise is the same as
"Delayed" below.

### Delayed

```js
import {Delayed} from "promise-stateful-lazy-loader"
class Foo {
    barDelayed = new Delayed.LazyValue(() => fetch("/bar"))
    get bar() {
        return this.barDelayed.value
    }
}
```

This is the basic, vanilla version. You just write your own getter wrapping the
underlying value, and it'll be a candidate for loading immediately after the
current execution context. If you want a different kind of loading delay, you
can see "Delay Options" below.

If you write `undefined` to the value, it will be wiped and become a candidate
for loading again, which you could do if you have reason to think it's now
invalid. You can also write other values, which would just get stored and
immediately drop any promise that's waiting to set the value.

### Delayed (Invalidate)

```js
import {Invalidate} from "promise-stateful-lazy-loader"
class Foo {
    barDelayed = new Invalidate.LazyValue(() => fetch("/bar"))
    get bar() {
        return this.barDelayed.value
    }

    constructor() {
        setInterval(() => this.barDelayed.invalidate(), 60 * 1000)
    }
}
```

This is a variation on "Delayed" which can be invalidated without losing its
value. You can use this when you want to avoid entering a period of value
uncertainty and can be reasonably sure that the old value will still be useful
while you're loading the new one.

This is a little more heavyweight than "Delayed", so should only be used if
you're pretty sure you will invalidate it.

### Immediate

```js
import {StatefulPromise} from "promise-stateful-lazy-loader"
class Foo {
    bar = new Map()
    getBar(b) {
        if(!this.bar.has(b)) {
            this.bar.set(
                b,
                StatefulPromise.immediate(() => fetch(`/bar/${b}`))
            )
        }
        return this.bar.get(b).value
    }
}
```

This is how you'd handle values which can't be known in advance. There's no
delay here, so you get the small benefit of not having to wait one extra
execution cycle. If you really just want the basics of this functionality, you
can DIY as

```js
    const v = {value: undefined}
    this.bar.set(b, v)
    fetch(`/bar/${b}`).then(r => v.value = r)
```

## Notes

### Delay Options

There's a second option to the `Delayed.LazyValue` constructor: the delay
time. This is `0` by default, which just kicks activation of the getter to after
the current run loop ends; usually that's a good idea if your state detection
software is going to evaluate your getter immediately, because you probably want
it to be triggered only when it's actually used.

You can safely set a longer delay (in milliseconds) if for some reason you want
it to be non-loadable for longer.

You can also use `Immediate.LazyValue` if you want it immediately loadable,
which can save you one run loop (perhaps relevant while iterating) but usually
`StatefulPromise.immediate` is more helpful for that kind of purpose.

You can also set it to `null` if you want to come back and call `.activate()`
yourself at some point, eg. if there's a very convoluted set of conditions after
which calling the loader will be valid.

### Different kinds of state tracking

There are two simple ways to track state:

1. Rewrite the object in-place. This is, in practice, the Observer pattern; it's
   heavier but will report every change from first modification
2. Wrap around the object with another - the Proxy pattern used for observation.
   This is lighter but can only affect callers which are actually using the
   proxy.

There's a key functional difference between the two, which is that anything the
object prepares to do to _itself_ before it's proxy-wrapped isn't ever going to
be known to the proxy, and that's a problem if you want any enumeration the
proxy does not to trigger any actions, which is the case here.

There are a couple of workarounds you can apply: either use `Immediate.LazyValue`,
accepting that it probably will be evaluated before there's any demand, or set
the delay to `null` and call `activate()` later.