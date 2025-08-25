// ====== SISTEMA DE BANCO DE DADOS (JSON) ======
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const GIVEAWAYS_FILE = path.join(DATA_DIR, 'giveaways.json');

// Garantir que o diretório data existe
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

module.exports = {
    // ====== FUNÇÕES DE USUÁRIOS ======
    getUser(userId) {
        try {
            if (!fs.existsSync(USERS_FILE)) {
                return null;
            }

            const data = fs.readFileSync(USERS_FILE, 'utf8');
            const users = JSON.parse(data);
            return users[userId] || null;

        } catch (error) {
            console.error('Erro ao ler dados do usuário:', error);
            return null;
        }
    },

    saveUser(userId, userData) {
        try {
            let users = {};

            if (fs.existsSync(USERS_FILE)) {
                const data = fs.readFileSync(USERS_FILE, 'utf8');
                users = JSON.parse(data);
            }

            users[userId] = userData;
            fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
            return true;

        } catch (error) {
            console.error('Erro ao salvar dados do usuário:', error);
            return false;
        }
    },

    getAllUsers() {
        try {
            if (!fs.existsSync(USERS_FILE)) {
                return {};
            }

            const data = fs.readFileSync(USERS_FILE, 'utf8');
            return JSON.parse(data);

        } catch (error) {
            console.error('Erro ao ler todos os usuários:', error);
            return {};
        }
    },

    // ====== FUNÇÕES DE SORTEIOS ======
    getGiveaway(giveawayId) {
        try {
            if (!fs.existsSync(GIVEAWAYS_FILE)) {
                return null;
            }

            const data = fs.readFileSync(GIVEAWAYS_FILE, 'utf8');
            const giveaways = JSON.parse(data);
            return giveaways[giveawayId] || null;

        } catch (error) {
            console.error('Erro ao ler dados do sorteio:', error);
            return null;
        }
    },

    saveGiveaway(giveawayId, giveawayData) {
        try {
            let giveaways = {};

            if (fs.existsSync(GIVEAWAYS_FILE)) {
                const data = fs.readFileSync(GIVEAWAYS_FILE, 'utf8');
                giveaways = JSON.parse(data);
            }

            giveaways[giveawayId] = giveawayData;
            fs.writeFileSync(GIVEAWAYS_FILE, JSON.stringify(giveaways, null, 2));
            return true;

        } catch (error) {
            console.error('Erro ao salvar dados do sorteio:', error);
            return false;
        }
    },

    getAllGiveaways() {
        try {
            if (!fs.existsSync(GIVEAWAYS_FILE)) {
                return {};
            }

            const data = fs.readFileSync(GIVEAWAYS_FILE, 'utf8');
            return JSON.parse(data);

        } catch (error) {
            console.error('Erro ao ler todos os sorteios:', error);
            return {};
        }
    },

    // ====== FUNÇÕES DE LIMPEZA ======
    cleanupExpiredGiveaways() {
        try {
            const giveaways = this.getAllGiveaways();
            const now = Date.now();
            let cleaned = false;

            for (const [id, giveaway] of Object.entries(giveaways)) {
                // Remover sorteios que terminaram há mais de 7 dias
                if (giveaway.ended && (now - giveaway.endTime) > (7 * 24 * 60 * 60 * 1000)) {
                    delete giveaways[id];
                    cleaned = true;
                }
            }

            if (cleaned) {
                fs.writeFileSync(GIVEAWAYS_FILE, JSON.stringify(giveaways, null, 2));
                console.log('🧹 Sorteios expirados removidos');
            }

        } catch (error) {
            console.error('Erro ao limpar sorteios expirados:', error);
        }
    },

    // ====== BACKUP E RESTAURAÇÃO ======
    createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupDir = path.join(DATA_DIR, 'backups');

            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir);
            }

            if (fs.existsSync(USERS_FILE)) {
                fs.copyFileSync(USERS_FILE, path.join(backupDir, `users_${timestamp}.json`));
            }

            if (fs.existsSync(GIVEAWAYS_FILE)) {
                fs.copyFileSync(GIVEAWAYS_FILE, path.join(backupDir, `giveaways_${timestamp}.json`));
            }

            console.log(`📦 Backup criado: ${timestamp}`);
            return true;

        } catch (error) {
            console.error('Erro ao criar backup:', error);
            return false;
        }
    }
};
