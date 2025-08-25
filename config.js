// ====== CONFIGURAÇÕES DO BOT ======
module.exports = {
    // Token e ID do bot - OBRIGATÓRIO via variáveis de ambiente
    BOT_TOKEN: process.env.BOT_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID || '1409206065085812899',
    
    // Link de convite
    INVITE_LINK: 'https://discord.com/api/oauth2/authorize?client_id=1409206065085812899&permissions=1099511627775&scope=bot%20applications.commands',
    
    // ID do usuário para reportar bugs (substitua pelo ID real)
    BUG_REPORT_USER_ID: process.env.BUG_REPORT_USER_ID || '1234567890123456789', // Substitua pelo ID real do yzzy155
    
    // Configurações de comandos
    PREFIX: '!',
    COOLDOWN_TIME: 3000, // 3 segundos
    
    // Cores para embeds
    COLORS: {
        SUCCESS: 0x00ff00,
        ERROR: 0xff0000,
        WARNING: 0xffff00,
        INFO: 0x0099ff,
        MODERATION: 0xff6600
    },
    
    // Configurações de moderação
    MODERATION: {
        MAX_WARNS: 3,
        MUTE_ROLE: 'Silenciado',
        VERIFIED_ROLE: 'Verificado',
        AUTO_ROLE: 'Membro'
    },
    
    // Configurações de keep-alive
    KEEP_ALIVE: {
        INTERVAL: 5 * 60 * 1000, // 5 minutos
        URL: process.env.REPLIT_URL || 'https://seu-bot-discord.replit.app' // Substitua pela URL do seu Repl
    }
};
