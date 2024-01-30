#!/usr/bin/env node

import ora from "ora";
import chalk from "chalk";
import GetInstallationDirectory from "./util/directory";
import { spawn } from "child_process";
import { promises as fs, existsSync } from "fs";
import { service } from "./util/service";

const installationDirectory = GetInstallationDirectory();

async function downloadFiles() {
    return new Promise<void>((resolve, reject) => {
        const spinner = ora("Downloading files...").start();

        const download = spawn(
            "curl",
            [
                "https://github.com/SnailyCAD-Manager/v3/releases/latest/download/linux.tar.gz",
                "-o",
                "linux.tar.gz",
            ],
            {
                cwd: installationDirectory,
            }
        );

        download.stdout.on("data", (data) => {
            console.log(data.toString());
        });

        download.stderr.on("data", (data) => {
            console.log(data.toString());
        });

        download.on("close", (code) => {
            if (code === 0) {
                spinner.succeed("Downloaded files.");
                resolve();
            } else {
                spinner.fail("Failed to download files.");
                reject();
                process.exit(1);
            }
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
            console.log(data.toString());
        });

        install.stderr.on("data", (data) => {
            console.log(data.toString());
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
