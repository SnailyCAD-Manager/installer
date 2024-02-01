#!/usr/bin/env node

import ora from "ora";
import chalk from "chalk";
import GetInstallationDirectory from "./util/directory";
import { spawn } from "child_process";
import { promises as fs, existsSync, createWriteStream } from "fs";
import axios from "axios";
import { service, start } from "./util/service";

const installationDirectory = GetInstallationDirectory();

console.log(
    chalk.greenBright(`Installation directory: ${installationDirectory}`)
);

async function downloadFiles() {
    return new Promise<void>(async (resolve, reject) => {
        const spinner = ora("Downloading files...").start();

        const download = await axios({
            url: "https://github.com/SnailyCAD-Manager/v3/releases/latest/download/linux.tar.gz",
            method: "GET",
            responseType: "stream",
        });

        download.data.pipe(
            createWriteStream(`${installationDirectory}/linux.tar.gz`)
        );

        download.data.on("end", () => {
            spinner.succeed("Downloaded files.");
            resolve();
        });
    });
}

async function extractFiles() {
    return new Promise<void>((resolve, reject) => {
        const spinner = ora("Extracting files...").start();

        const extract = spawn("tar", ["-xzf", "linux.tar.gz"], {
            cwd: installationDirectory,
        });

        extract.stdout.on("data", (data) => {
            console.log(data.toString());
        });

        extract.stderr.on("data", (data) => {
            console.log(data.toString());
        });

        extract.on("close", (code) => {
            if (code === 0) {
                spinner.succeed("Extracted files.");
                resolve();
            } else {
                spinner.fail("Failed to extract files.");
                reject();
                process.exit(1);
            }
        });
    });
}

async function installDependencies() {
    return new Promise<void>((resolve, reject) => {
        const spinner = ora("Installing dependencies...").start();

        const install = spawn("pnpm", ["install", "--prod=false"], {
            cwd: installationDirectory,
        });

        install.stdout.on("data", (data) => {
            spinner.text = `Installing dependencies: ${data.toString()}`;
        });

        install.stderr.on("data", (data) => {
            spinner.text = `Installing dependencies: ${data.toString()}`;
        });

        install.on("close", (code) => {
            if (code === 0) {
                spinner.succeed("Installed dependencies.");
                resolve();
            } else {
                spinner.fail("Failed to install dependencies.");
                reject();
                process.exit(1);
            }
        });
    });
}

async function createStartScript() {
    return new Promise<void>((resolve, reject) => {
        const spinner = ora("Creating start script...").start();
        // Needs execution permissions
        fs.writeFile(`${installationDirectory}/start.sh`, start, {
            encoding: "utf-8",
            flag: "w",
        })
            .then(() => {
                spinner.succeed("Created start script.");
                resolve();
            })
            .catch(() => {
                spinner.fail("Failed to create start script.");
                reject();
                process.exit(1);
            });

        spawn("chmod", ["+x", "start.sh"], { cwd: installationDirectory });

        spinner.succeed("Created start script.");
    });
}

async function createService() {
    return new Promise<void>((resolve, reject) => {
        const spinner = ora("Creating service...").start();

        fs.writeFile("/etc/systemd/system/snailycad-manager.service", service, {
            encoding: "utf-8",
            flag: "w",
        })
            .then(() => {
                spinner.succeed("Created service.");
                resolve();
            })
            .catch(() => {
                spinner.fail("Failed to create service.");
                reject();
                process.exit(1);
            });
    });
}

async function reloadServices() {
    return new Promise<void>((resolve, reject) => {
        const spinner = ora("Reloading services...").start();

        const reload = spawn("systemctl", ["daemon-reload"]);

        reload.on("close", (code) => {
            if (code === 0) {
                spinner.succeed("Reloaded services.");
                resolve();
            } else {
                spinner.fail("Failed to reload services.");
                reject();
                process.exit(1);
            }
        });
    });
}

async function enableService() {
    return new Promise<void>((resolve, reject) => {
        const spinner = ora("Enabling service...").start();

        const enable = spawn("systemctl", ["enable", "snailycad-manager"]);

        enable.on("close", (code) => {
            if (code === 0) {
                spinner.succeed("Enabled service.");
                resolve();
            } else {
                spinner.fail("Failed to enable service.");
                reject();
                process.exit(1);
            }
        });
    });
}

async function startService() {
    return new Promise<void>((resolve, reject) => {
        const spinner = ora("Starting service...").start();

        const start = spawn("systemctl", ["start", "snailycad-manager"]);

        start.on("close", (code) => {
            if (code === 0) {
                spinner.succeed("Started service.");
                resolve();
            } else {
                spinner.fail("Failed to start service.");
                reject();
                process.exit(1);
            }
        });
    });
}

async function main() {
    console.clear(); // Clear the terminal when the installer starts. (Looks cleaner)

    if (!existsSync(installationDirectory)) {
        await fs.mkdir(installationDirectory);
    }

    await downloadFiles();
    await extractFiles();
    await installDependencies();
    await createStartScript();
    await createService();
    await reloadServices();
    await enableService();
    await startService();

    console.log(
        chalk.greenBright(
            "SnailyCAD Manager has been successfully installed on your system."
        )
    );
}

main();
