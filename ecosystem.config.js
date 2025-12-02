module.exports = {
    apps: [
        {
            name: "proxmox",
            script: "npm",
            args: "run start",
            env: {
                PORT: 3007
            }
        }
    ]
}