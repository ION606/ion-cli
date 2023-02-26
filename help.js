import chalk from "chalk"
const commandList = ['anime <name="string", option="string">']

export default function help(subcommand = []) {
    if (subcommand.length != 0) {
        console.log(chalk.green(commandList[commandList.indexOf(subcommand)]))
    } else {
        for (const i of commandList) {
            console.log(chalk.cyanBright(i));
        }
    }
}