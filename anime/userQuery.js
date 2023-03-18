import chalk from "chalk";
import readline from 'readline'

export function generateQuery(context) {
    var query;
    if (context == "animeep") {
        query = "To dump all data enter ";
        query += chalk.red("dumpdata");
        query += `\nTo get the anime description enter ${chalk.green("desc")}`;
        query += "\nTo dump episode data enter ";
        query += chalk.yellow("episodes-all");
        query += ", therwise, enter the " + chalk.yellow("episode number\n");
        query += chalk.italic("Note: to compile with an episode number use");
        query += chalk.blueBright(" --anime name=name episode=#\n");
    }

    return query;
}



/**
 * @param {String} query 
 * @returns {Promise<String>}
 */
export function askUserQuery(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))

}