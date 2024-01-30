export const service = `
Description=SnailyCAD Manager Service

Wants=network.target
After=syslog.target network-online.target

[Service]
Type=simple
ExecStart=scm start
Restart=on-failure
RestartSec=10
KillMode=process

[Install]
WantedBy=multi-user.target
`;
