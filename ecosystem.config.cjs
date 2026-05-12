module.exports = {
    apps: [
        {
            name: "attendance-pwa-frontend",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "production",
                PORT: 3003
            }
        }
    ]
}
