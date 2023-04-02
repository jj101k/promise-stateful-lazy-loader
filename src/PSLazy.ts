import { Constructs } from "./Constructs"
import { AddLazyStates } from "./AddLazyStates"
import { Logger } from "./Logger"
import { LazyStateInfo } from "./LazyStateInfo"

/**
 * Functionality for lazy state loading via decorators
 */
export class PSLazy {
    /**
     *
     */
    public static logger = Logger.inst

    /**
     * The lazy state configurations that have been seen
     */
    private static readonly lazyStateConfigurations: LazyStateInfo<any>[] = []

    /**
     * Returns the lazy state configuration for the target, creating one (and
     * storing it) if needed.
     *
     * @param target
     */
    private static lazyStateConfigurationFor<T>(target: T): LazyStateInfo<T> {
        let config = this.lazyStateConfigurations.find(
            config => config.prototype === target
        ) as LazyStateInfo<T> | undefined
        if (!config) {
            config = {
                prototype: target,
                lazyStates: new Map(),
            }
            this.lazyStateConfigurations.push(config)
        }
        return config
    }

    /**
     * This marks a property as a lazy state (see LazyStates)
     *
     * Usage (typescript):
     *
     * ```ts
     *  @PSLazy.lazyState(() => fetch("/bar"))
     *  bar!: string
     * ```
     *
     * @see lazyStates(), which must be used on the class also.
     *
     * @param loader The function which will load the value
     */
    static lazyState<T, P>(loader: () => Promise<P> | P) {
        /**
         *
         * @param target
         * @param propertyName
         */
        return (target: T, propertyName: string) => {
            const config = this.lazyStateConfigurationFor(target)
            config.lazyStates.set(propertyName, loader)
            this.logger.log(`Found property ${propertyName}`)
            const logger = this.logger
            Object.defineProperty(target, propertyName, {
                get() {
                    logger.log(`Get ${propertyName}`)
                    return this._lazy[propertyName].value
                },
                set(v) {
                    logger.log(`Set ${propertyName}`)
                    return this._lazy[propertyName].value = v
                },
            })
        }
    }

    /**
     * This defines that the class has lazy states, and connects them in the
     * constructor.
     *
     * Usage:
     *
     * ```js
     * @PSLazy.lazyStates
     * class Foo {
     * ```
     *
     * @param lazyClass
     */
    static lazyStates<C extends Constructs<T>, T>(lazyClass: C) {
        const config = PSLazy.lazyStateConfigurationFor(lazyClass.prototype)

        PSLazy.logger.log(`Wrapping the class ${lazyClass.name}`)

        if (config.lazyStates.size == 0) {
            console.warn(`Class ${lazyClass.name} marked as lazy with no lazy properties`)
        }

        return AddLazyStates(lazyClass, config)
    }
}