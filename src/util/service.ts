import GetInstallationDirectory from "./directory";

export const service = `
[Unit]
Description=SnailyCAD Auto Start Service

[Service]
Type=simple
ExecStart=/bin/bash ${GetInstallationDirectory()}/start.sh

[Install]
WantedBy=default.target
`;

export const start = `
#!/bin/bash
cd ${GetInstallationDirectory()}
pnpm start
`;
