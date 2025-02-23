import { checkAuth } from './auth.js';
import { setupContentManager } from './contentManager.js';
import { setupUserManager } from './userManager.js';

document.addEventListener("DOMContentLoaded", async () => {
    // Verifica autenticação
    if (!checkAuth()) {
        return;
    }

    // Configura o gerenciamento de conteúdos
    setupContentManager();

    // Configura o gerenciamento de usuários
    setupUserManager();
});
