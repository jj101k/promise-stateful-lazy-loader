import { Logger } from "./Logger"
import { DelayedLazyValue } from "./DelayedLazyValue"

/**
 * This is the set of lazy states for a prototype
 */
interface LazyStateInfo<T> {
    /**
     * The prototype this applies to
     */
    prototype: T

    /**
     * The lazy state functions by property name
     */
    lazyStates: Map<string | number, () => Promise<any> | any>
}

/**
 * Functionality for lazy state loading via decorators
 */
export class Decorator {
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
        const storedConfig = this.lazyStateConfigurations.find(
            config => config.prototype === target
        )
        if (storedConfig) {
            return storedConfig
        } else {
            const config = {
                prototype: target,
                lazyStates: new Map(),
            }
            this.lazyStateConfigurations.push(config)
            return config
        }
    }

    /**
     * This marks a property as a lazy state (see LazyStates)
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
     */
    static lazyStates<T extends { new(...args: any[]): any}>() {
        /**
         * @param lazyClass
         */
        return (lazyClass: T) => {
            const config = this.lazyStateConfigurationFor(lazyClass.prototype)

            if (config.lazyStates.size > 0) {
                this.logger.log(`Wrapping the class ${lazyClass.name}`)

                return class extends lazyClass {
                    /**
                     *
                     */
                    protected _lazy: { [propertyName: string]: DelayedLazyValue<T>}  = {};

                    constructor(...args: any[]) {
                        super(...args)
                        for (const [propertyName, f] of config.lazyStates.entries()) {
                            this._lazy[propertyName] = new DelayedLazyValue(f)
                        }
                    }
                }
            } else {
                console.warn(`Class ${lazyClass.name} marked as lazy with no lazy properties`)
                return lazyClass
            }
        }
    }
}