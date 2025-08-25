// ====== EVENTO: NOVO MEMBRO ======
const registration = require('../commands/registration');
const database = require('../utils/database');
const config = require('../config/config');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member, client) {
        console.log(`👋 Novo membro entrou: ${member.user.tag} em ${member.guild.name}`);

        try {
            // Verificar se é um bot
            if (member.user.bot) return;

            // Verificar se já está registrado
            const userData = database.getUser(member.id);
            if (userData && userData.registered) {
                console.log(`ℹ️ Usuário ${member.user.tag} já registrado anteriormente`);
                return;
            }

            // Buscar canal de boas-vindas ou canal geral
            let welcomeChannel = member.guild.channels.cache.find(channel => 
                channel.name.includes('welcome') || 
                channel.name.includes('bem-vindo') ||
                channel.name.includes('geral') ||
                channel.name.includes('general')
            );

            // Se não encontrar, usar o canal do sistema
            if (!welcomeChannel) {
                welcomeChannel = member.guild.systemChannel;
            }

            // Se ainda não encontrar, usar o primeiro canal de texto disponível
            if (!welcomeChannel) {
                welcomeChannel = member.guild.channels.cache
                    .filter(channel => channel.type === 0 && channel.permissionsFor(client.user).has('SendMessages'))
                    .first();
            }

            if (welcomeChannel) {
                // Enviar mensagem de registro personalizada
                await registration.sendRegistrationMessage(welcomeChannel, member.user);
                
                // Também enviar DM para o usuário
                try {
                    const dmEmbed = {
                        color: config.COLORS.INFO,
                        title: `🎉 Bem-vindo(a) ao ${member.guild.name}!`,
                        description: `Olá ${member.user}! Para ter acesso completo ao servidor, você precisa se registrar e verificar sua conta.`,
                        fields: [
                            { name: '📍 Onde se registrar:', value: `Vá ao canal ${welcomeChannel} e clique no botão "Registrar"`, inline: false },
                            { name: '❓ Precisa de ajuda?', value: 'Digite `!help` no servidor para ver todos os comandos disponíveis', inline: false }
                        ],
                        footer: { text: 'Esperamos você na comunidade!' },
                        timestamp: new Date()
                    };

                    await member.send({ embeds: [dmEmbed] });
                } catch (dmError) {
                    console.log(`⚠️ Não foi possível enviar DM para ${member.user.tag}`);
                }

                console.log(`✅ Mensagem de registro enviada para ${member.user.tag}`);
            } else {
                console.log(`⚠️ Nenhum canal adequado encontrado em ${member.guild.name}`);
            }

        } catch (error) {
            console.error('❌ Erro ao processar novo membro:', error);
        }
    }
};
