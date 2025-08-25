// ====== SISTEMA KEEP-ALIVE ======
const http = require('http');
const https = require('https');
const config = require('../config/config');

module.exports = {
    intervalId: null,

    start() {
        console.log('🔄 Iniciando sistema keep-alive...');

        // Fazer ping a cada 5 minutos
        this.intervalId = setInterval(() => {
            this.ping();
        }, config.KEEP_ALIVE.INTERVAL);

        // Fazer primeiro ping após 30 segundos
        setTimeout(() => {
            this.ping();
        }, 30000);
    },

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏹️ Sistema keep-alive parado');
        }
    },

    ping() {
        const url = config.KEEP_ALIVE.URL;
        
        if (!url || url === 'http://localhost:3000') {
            console.log('⚠️ URL de keep-alive não configurada');
            return;
        }

        const isHttps = url.startsWith('https');
        const httpModule = isHttps ? https : http;

        const options = {
            method: 'GET',
            timeout: 10000 // 10 segundos
        };

        const req = httpModule.get(url, options, (res) => {
            console.log(`🏓 Keep-alive ping: ${res.statusCode} - ${new Date().toLocaleTimeString('pt-BR')}`);
            
            // Consumir resposta para evitar memory leak
            res.on('data', () => {});
            res.on('end', () => {});
        });

        req.on('error', (error) => {
            console.error('❌ Erro no keep-alive ping:', error.message);
        });

        req.on('timeout', () => {
            console.error('⏰ Keep-alive ping timeout');
            req.destroy();
        });
    },

    // Verificar status da aplicação
    async checkHealth() {
        return new Promise((resolve) => {
            try {
                const memoryUsage = process.memoryUsage();
                const uptime = process.uptime();

                const health = {
                    status: 'healthy',
                    uptime: uptime,
                    memory: {
                        used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
                        total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
                    },
                    timestamp: new Date().toISOString()
                };

                resolve(health);
            } catch (error) {
                resolve({
                    status: 'unhealthy',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });
    },

    // Ping personalizado para UptimeRobot
    async uptimeRobotPing() {
        try {
            // URLs comuns de serviços de uptime
            const uptimeServices = [
                'https://uptimerobot.com',
                'https://ping.uptimerobot.com',
                'https://stats.uptimerobot.com'
            ];

            for (const service of uptimeServices) {
                try {
                    await this.pingUrl(service);
                    console.log(`✅ Ping enviado para: ${service}`);
                } catch (error) {
                    console.log(`⚠️ Falha no ping para: ${service}`);
                }
            }
        } catch (error) {
            console.error('❌ Erro no UptimeRobot ping:', error);
        }
    },

    pingUrl(url) {
        return new Promise((resolve, reject) => {
            const isHttps = url.startsWith('https');
            const httpModule = isHttps ? https : http;

            const req = httpModule.get(url, { timeout: 5000 }, (res) => {
                resolve(res.statusCode);
                res.on('data', () => {});
                res.on('end', () => {});
            });

            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
        });
    }
};
