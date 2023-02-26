
/**
 * @returns { Promise<JSON>>}
 */
export function getAndParse() {
    return new Promise((resolve) => {
        const argsRaw = [...process.argv].slice(2);
        const args = {};
        // const keys = {};
        // for (const i of argsRaw) {
        //     if (i.indexOf('--') !== -1) {
        //         keys[i.split('--')[1]] = argsRaw.indexOf(i)
        //     }
        // }
        const keys = argsRaw.join(" ").split("--");
        for (const i of keys) {
            if (i.length == 0) continue;

            const splitContent = i.split(" ");
            args[splitContent[0]] = splitContent.slice(1);
        }

        return resolve(args);
    });
}
