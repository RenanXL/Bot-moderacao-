// ====== EVENTO: MENSAGENS ======
const commandHandler = require('../handlers/commandHandler');
const config = require('../config/config');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        // Ignorar bots
        if (message.author.bot) return;

        // Ignorar mensagens sem prefixo
        if (!message.content.startsWith(config.PREFIX)) return;

        // Log de comando usado
        console.log(`🔧 Comando usado: ${message.content} por ${message.author.tag} em ${message.guild?.name || 'DM'}`);

        try {
            // Processar comando
            await commandHandler.handleCommand(message, client);

        } catch (error) {
            console.error('❌ Erro ao processar mensagem:', error);
            
            if (message.channel) {
                message.reply('❌ Ocorreu um erro ao processar seu comando!').catch(() => {});
            }
        }
    }
};
