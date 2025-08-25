// ====== DISCORD BOT PRINCIPAL ======
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const express = require('express');
const path = require('path');
const config = require('./config/config');
const keepAlive = require('./utils/keepAlive');
const eventHandler = require('./handlers/eventHandler');
const commandHandler = require('./handlers/commandHandler');

// Criar cliente Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Coleção de comandos e cooldowns
client.commands = new Collection();
client.cooldowns = new Collection();

// ====== SERVIDOR EXPRESS PARA UPTIME ======
const app = express();

app.get('/', (req, res) => {
    const uptimeInfo = {
        status: 'online',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        guilds: client.guilds ? client.guilds.cache.size : 0,
        users: client.users ? client.users.cache.size : 0
    };
    res.json(uptimeInfo);
});

app.get('/health', (req, res) => {
    res.status(200).send('Bot está funcionando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌍 Servidor web rodando na porta ${PORT}`);
});

// ====== INICIALIZAÇÃO ======
async function startBot() {
    try {
        // Verificar se o token está configurado
        if (!config.BOT_TOKEN) {
            console.error('❌ ERRO: BOT_TOKEN não configurado! Configure a variável de ambiente BOT_TOKEN.');
            process.exit(1);
        }

        // Carregar comandos e eventos
        await commandHandler.loadCommands(client);
        await eventHandler.loadEvents(client);

        // Evento quando bot está pronto
        client.once('ready', () => {
            console.log(`✅ Bot logado como ${client.user.tag}`);
            console.log(`📊 Servidores: ${client.guilds.cache.size}`);
            console.log(`👥 Usuários: ${client.users.cache.size}`);
            
            // Definir atividade
            client.user.setActivity('!help', { type: ActivityType.Watching });
            
            // Tornar cliente global para sorteios
            global.client = client;
            
            // Reagendar sorteios pendentes
            rescheduleGiveaways();
            
            // Iniciar keep-alive
            keepAlive.start();
        });

        // Login no Discord
        await client.login(config.BOT_TOKEN);

    } catch (error) {
        console.error('❌ Erro ao iniciar o bot:', error);
        process.exit(1);
    }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    process.exit(1);
});

// ====== REAGENDAR SORTEIOS ======
function rescheduleGiveaways() {
    try {
        const database = require('./utils/database');
        const giveawayModule = require('./commands/giveaway');
        const giveaways = database.getAllGiveaways();
        const now = Date.now();
        let rescheduled = 0;
        let ended = 0;

        for (const [id, giveaway] of Object.entries(giveaways)) {
            if (giveaway.ended) continue;

            if (now >= giveaway.endTime) {
                // Sorteio vencido, finalizar imediatamente
                setTimeout(() => giveawayModule.endGiveaway(id), 1000);
                ended++;
            } else {
                // Reagendar sorteio
                const remainingTime = giveaway.endTime - now;
                setTimeout(() => giveawayModule.endGiveaway(id), remainingTime);
                rescheduled++;
            }
        }

        if (rescheduled > 0 || ended > 0) {
            console.log(`🎉 Sorteios reagendados: ${rescheduled} | Finalizados: ${ended}`);
        }

        // Scanner de segurança a cada hora
        setInterval(() => {
            const allGiveaways = database.getAllGiveaways();
            const currentTime = Date.now();
            
            for (const [id, giveaway] of Object.entries(allGiveaways)) {
                if (!giveaway.ended && currentTime >= giveaway.endTime) {
                    console.log(`⚠️ Finalizando sorteio vencido: ${id}`);
                    giveawayModule.endGiveaway(id);
                }
            }
        }, 60 * 60 * 1000); // 1 hora

    } catch (error) {
        console.error('❌ Erro ao reagendar sorteios:', error);
    }
}

// Iniciar bot
startBot();

module.exports = client;
