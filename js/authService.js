// js/authService.js

const API_BASE_URL = "http://localhost:3000"; // Defina a URL base da sua API aqui

// --- Funções de Gerenciamento de Chaves do Dispositivo (localStorage) ---
function storeDeviceKeys(apiKey, criptoKey) {
    try {
        localStorage.setItem('pobreflix_api_key', apiKey);
        localStorage.setItem('pobreflix_cripto_key', criptoKey);
        console.log("Chaves do dispositivo armazenadas.");
    } catch (e) {
        console.error("Erro ao armazenar chaves do dispositivo:", e);
        // A UI deve ser notificada por quem chama esta função
        throw new Error("Erro ao salvar configuração do dispositivo.");
    }
}

function getDeviceKeys() {
    try {
        const apiKey = localStorage.getItem('pobreflix_api_key');
        const criptoKey = localStorage.getItem('pobreflix_cripto_key');
        if (apiKey && criptoKey) {
            return { apiKey, criptoKey };
        }
        return null;
    } catch (e) {
        console.error("Erro ao recuperar chaves do dispositivo:", e);
        return null;
    }
}

function clearDeviceKeys() {
    try {
        localStorage.removeItem('pobreflix_api_key');
        localStorage.removeItem('pobreflix_cripto_key');
        console.log("Chaves do dispositivo removidas.");
    } catch (e) {
        console.error("Erro ao remover chaves do dispositivo:", e);
    }
}

// --- Função para obter nome do dispositivo (baseado no navegador) ---
function getBrowserDeviceName() {
    const ua = navigator.userAgent;
    let browserName = "Navegador Desconhecido";
    if (ua.includes("Firefox")) browserName = "Firefox";
    else if (ua.includes("SamsungBrowser")) browserName = "Samsung Internet";
    else if (ua.includes("Opera") || ua.includes("OPR")) browserName = "Opera";
    else if (ua.includes("Edge") || ua.includes("Edg")) browserName = "Edge";
    else if (ua.includes("Chrome")) browserName = "Chrome";
    else if (ua.includes("Safari")) browserName = "Safari";

    const platform = navigator.platform || "Plataforma Desconhecida";
    return `${browserName} em ${platform}`;
}

// --- Função de Registro do Dispositivo na API ---
async function registerDeviceOnApi(displayMessageCallback) {
    const deviceName = getBrowserDeviceName();
    if (displayMessageCallback) displayMessageCallback("Registrando dispositivo...", "info");
    try {
        const response = await fetch(`${API_BASE_URL}/devices/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome_dispositivo: deviceName })
        });

        const data = await response.json(); // Tenta parsear JSON mesmo em erro para pegar a mensagem da API
        if (!response.ok) {
            throw new Error(data.error || `Erro ${response.status} ao registrar dispositivo.`);
        }

        if (data.api_key && data.cripto_key) {
            storeDeviceKeys(data.api_key, data.cripto_key);
            if (displayMessageCallback) displayMessageCallback("Dispositivo registrado com sucesso!", "success");
            return { apiKey: data.api_key, criptoKey: data.cripto_key };
        } else {
            throw new Error("Resposta da API de registro de dispositivo incompleta.");
        }
    } catch (error) {
        console.error("Falha ao registrar dispositivo:", error);
        if (displayMessageCallback) displayMessageCallback(`Falha ao registrar dispositivo: ${error.message}`, "error");
        throw error;
    }
}

// --- Função de Inicialização do App (verifica/registra dispositivo) ---
async function initializeAppAndGetDeviceKeys(displayMessageCallback) {
    let deviceKeys = getDeviceKeys();
    if (!deviceKeys) {
        try {
            console.log("Nenhuma chave de dispositivo encontrada. Registrando novo dispositivo...");
            // Passa o callback para a função de registro
            deviceKeys = await registerDeviceOnApi(displayMessageCallback);
        } catch (error) {
            // Erro já exibido por registerDeviceOnApi através do callback
            return null; // Indica falha na obtenção das chaves
        }
    }
    return deviceKeys; // Retorna as chaves (existentes ou recém-registradas)
}

// --- Função Principal de Login ---
async function performSecureLogin(email, password, displayMessageCallback) {
    if (displayMessageCallback) displayMessageCallback("Processando login...", "info");

    if (!email || !password) {
        if (displayMessageCallback) displayMessageCallback("Preencha todos os campos.", "error");
        return;
    }

    // 1. Garante que temos as chaves do dispositivo
    const deviceKeys = await initializeAppAndGetDeviceKeys(displayMessageCallback);
    if (!deviceKeys) {
        // Mensagem de erro já deve ter sido exibida
        return;
    }

    // 2. Criptografa o payload de login
    const loginPayload = { email, password };
    const payloadString = JSON.stringify(loginPayload);
    // encryptPayloadWithForge é do cryptoService.js e deve estar no escopo global
    const encryptedBody = encryptPayloadWithForge(payloadString, deviceKeys.criptoKey);

    if (!encryptedBody) {
        if (displayMessageCallback) displayMessageCallback("Falha crítica na criptografia do payload.", "error");
        return;
    }

    // 3. Tenta fazer o login
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": deviceKeys.apiKey
            },
            body: JSON.stringify(encryptedBody),
        });

        const data = await response.json();

        if (!response.ok) {
            if ((response.status === 401 || response.status === 403) && data.error && data.error.toLowerCase().includes("api key")) {
                if (displayMessageCallback) displayMessageCallback(`Erro de API Key: ${data.error}. Registrando novo dispositivo...`, "warning");
                clearDeviceKeys();
                await initializeAppAndGetDeviceKeys(displayMessageCallback);
                if (displayMessageCallback) displayMessageCallback("Dispositivo re-registrado. Por favor, tente fazer login novamente.", "info");
                return; // Não prossegue com o erro de login original
            }
            throw new Error(data.error || "Erro ao fazer login. Verifique suas credenciais.");
        }

        // Login bem-sucedido
        localStorage.setItem("token", data.token);
        localStorage.setItem("pobreflix_user_id", data.user.id);
        localStorage.setItem("pobreflix_user_info", JSON.stringify(data.user));

        console.log("Login bem-sucedido! ID:", data.user.id, "Usuário:", data.user.name);
        if (displayMessageCallback) displayMessageCallback(`Login bem-sucedido! Bem-vindo, ${data.user.name}. Redirecionando...`, "success");

        setTimeout(() => {
            window.location.href = "./homepage_user.html"; // Ajuste o caminho se necessário
        }, 1500);

    } catch (error) {
        console.error("Erro no login (authService.js):", error);
        if (displayMessageCallback) displayMessageCallback(error.message, "error");
    }
}
