// js/loginUIScript.js

// --- Função para exibir mensagens na UI ---
function displayMessage(message, type = "info") { // type pode ser 'info', 'success', 'error', 'warning'
    const messageElement = document.getElementById("statusMessage");
    if (messageElement) {
        messageElement.textContent = message;
        // Adapta para classes Bootstrap de cor de texto
        let className = '';
        switch (type) {
            case 'success': className = 'text-success'; break;
            case 'error': className = 'text-danger'; break;
            case 'warning': className = 'text-warning'; break;
            case 'info': default: className = 'text-info'; break;
        }
        messageElement.className = className; // Remove classes antigas e define a nova
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Tenta inicializar e obter/registrar chaves do dispositivo ao carregar a página.
    // As funções initializeAppAndGetDeviceKeys e displayMessage devem estar disponíveis globalmente
    // ou importadas se estiver usando módulos ES6.
    // Para este exemplo, assumimos que authService.js e cryptoService.js foram carregados antes
    // e suas funções estão no escopo global.
    if (typeof initializeAppAndGetDeviceKeys === 'function') {
        initializeAppAndGetDeviceKeys(displayMessage).then(keys => {
            if (keys) {
                console.log("Dispositivo pronto com chaves (UI):", keys.apiKey.substring(0,10) + "...");
                // Não precisa mostrar mensagem de sucesso aqui, só se houver erro no login
            } else {
                console.warn("Não foi possível obter/registrar chaves do dispositivo no carregamento inicial (UI).");
                // A função initializeAppAndGetDeviceKeys já chama displayMessage em caso de erro.
            }
        }).catch(err => {
            // Erro já tratado e exibido por initializeAppAndGetDeviceKeys
            console.error("Erro na inicialização no DOMContentLoaded (UI):", err);
        });
    } else {
        console.error("Função initializeAppAndGetDeviceKeys não encontrada. Verifique a ordem dos scripts.");
        displayMessage("Erro de configuração da página.", "error");
    }


    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const emailInput = document.getElementById("email");
            const passwordInput = document.getElementById("password");

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (typeof performSecureLogin === 'function') {
                await performSecureLogin(email, password, displayMessage);
            } else {
                console.error("Função performSecureLogin não encontrada. Verifique a ordem dos scripts.");
                displayMessage("Erro ao tentar realizar o login.", "error");
            }
        });
    } else {
        console.error("Formulário de login não encontrado.");
    }
});
