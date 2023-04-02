/**
 * Shared logger functionality, so that you can toggle logging off and on
 */
export class Logger {
    /**
     *
     */
    public static readonly inst = new Logger()

    /**
     *
     * @param debug
     */
    constructor(public debug = false) {

    }

    /**
     *
     * @param args
     */
    public log(...args: any[]) {
        if(this.debug) {
            console.debug(...args)
        }
    }
}