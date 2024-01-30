import path from "path";
import chalk from "chalk";

export default function GetInstallationDirectory() {
    if (process.platform === "win32") {
        console.log(
            chalk.redBright("Windows is not supported with this installer yet.")
        );
        process.exit(1);
    } else if (process.platform === "darwin") {
        console.log(
            chalk.redBright("MacOS is not supported by SnailyCAD Manager.")
        );
        process.exit(1);
    } else if (process.platform === "linux") {
        return path.resolve(process.env.HOME as string, ".snailycad-manager");
    } else {
        throw new Error("Unknown platform.");
    }
}
