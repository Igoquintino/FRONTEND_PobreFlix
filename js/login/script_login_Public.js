// Base URL para suas requisições de API
const API_BASE_URL = "http://localhost:3000"; //

const loginButton = document.getElementById("loginButton"); //
const errorMessage = document.getElementById("errorMessage"); //

// --- Funções Auxiliares de Armazenamento Local ---
function setLocalStorageItem(key, value) { //
    try { //
        localStorage.setItem(key, value); //
    } catch (e) { //
        console.error(`Erro ao salvar no localStorage a chave ${key}:`, e); //
        errorMessage.textContent = "Seu navegador não suporta armazenamento local ou está cheio."; //
    } //
} //

function getLocalStorageItem(key) { //
    try { //
        return localStorage.getItem(key); //
    } catch (e) { //
        console.error(`Erro ao ler do localStorage a chave ${key}:`, e); //
        return null; //
    } //
} //

function removeLocalStorageItem(key) { //
    try { //
        localStorage.removeItem(key); //
    } catch (e) { //
        console.error(`Erro ao remover do localStorage a chave ${key}:`, e); //
    } //
} //

// --- Função Genérica para Requisições HTTP ---
async function sendRequest(url, method, body = null, includeAuth = false, includeDeviceKeys = false) { //
    const headers = { //
        "Content-Type": "application/json", //
    }; //

    if (includeAuth) { //
        const token = getLocalStorageItem("token"); //
        if (token) { //
            headers["Authorization"] = `Bearer ${token}`; //
        } else { //
            console.warn("Requisição autenticada, mas o token não foi encontrado."); //
            // Opcional: redirecionar para login ou lidar com a falta de token
        } //
    } //

    if (includeDeviceKeys) { //
        const apiKey = getLocalStorageItem("api_key"); //
        const criptoKey = getLocalStorageItem("cripto_key"); //
        if (apiKey) { //
            headers["X-API-Key"] = apiKey; //
        } //
        if (criptoKey) { //
            headers["X-Encryption-Key-Id"] = criptoKey; //
        } //
    } //

    const options = { //
        method: method, //
        headers: headers, //
        body: body ? JSON.stringify(body) : null, //
    }; //

    const response = await fetch(url, options); //

    // Tenta sempre ler o JSON para obter mensagens de erro detalhadas
    const data = await response.json().catch(() => ({})); //

    if (!response.ok) { //
        throw { //
            status: response.status, //
            message: data.error || "Erro desconhecido na requisição.", //
            data: data, //
        }; //
    } //

    return data; //
} //

// --- Função para Registrar o Dispositivo ---
async function registerDevice() { //
    let apiKey = getLocalStorageItem("api_key"); //
    let criptoKey = getLocalStorageItem("cripto_key"); //

    if (!apiKey || !criptoKey) { //
        console.log("api_key ou cripto_key não encontradas. Registrando novo dispositivo..."); //
        try { //
            const deviceName = `Navegador: ${navigator.userAgent}`; //
            const data = await sendRequest(`${API_BASE_URL}/devices/register`, "POST", { //
                nome_dispositivo: deviceName //
            }); //

            setLocalStorageItem('api_key', data.api_key); //
            setLocalStorageItem('cripto_key', data.cripto_key); //
            console.log("Dispositivo registrado com sucesso!", data); //
        } catch (error) { //
            console.error("Erro ao registrar o dispositivo:", error); //
            errorMessage.textContent = "Não foi possível registrar o dispositivo. Tente novamente."; //
            loginButton.disabled = true; //
        } //
    } else { //
        console.log("api_key e cripto_key já existem. Dispositivo pronto."); //
    } //
} //

// --- Lógica de Bloqueio de Tentativas de Login (Frontend) ---
const MAX_LOGIN_ATTEMPTS = 3; //
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutos em milissegundos //

function getLoginAttempts() { //
    return parseInt(getLocalStorageItem('loginAttempts') || '0'); //
} //

function incrementLoginAttempts() { //
    let attempts = getLoginAttempts(); //
    attempts++; //
    setLocalStorageItem('loginAttempts', attempts.toString()); //
    if (attempts >= MAX_LOGIN_ATTEMPTS) { //
        setLocalStorageItem('lockoutTime', Date.now().toString()); //
        applyLockout(); //
    } //
} //

function resetLoginAttempts() { //
    removeLocalStorageItem('loginAttempts'); //
    removeLocalStorageItem('lockoutTime'); //
    loginButton.disabled = false; //
    loginButton.textContent = "Sign in"; //
} //

function applyLockout() { //
    const lockoutTime = parseInt(getLocalStorageItem('lockoutTime') || '0'); //
    const now = Date.now(); //

    if (lockoutTime && now < lockoutTime + LOCKOUT_DURATION_MS) { //
        loginButton.disabled = true; //
        const timeLeft = Math.ceil((lockoutTime + LOCKOUT_DURATION_MS - now) / 1000); //
        errorMessage.textContent = `Tentativa bloqueada por excesso de vezes. Tente novamente em ${timeLeft} segundos.`; //
        setTimeout(applyLockout, 1000); // Verifica novamente em 1 segundo //
    } else { //
        resetLoginAttempts(); //
    } //
} //

// --- Inicialização ao Carregar a Página ---
document.addEventListener("DOMContentLoaded", async () => { //
    await registerDevice(); // Tenta registrar o dispositivo ou verifica as chaves existentes //
    applyLockout(); // Verifica se há bloqueio de login ativo //
}); //

// --- Event Listener para o Formulário de Login ---
document.getElementById("loginForm").addEventListener("submit", async (event) => { //
    event.preventDefault(); // Previne o envio padrão do formulário //

    errorMessage.textContent = ""; // Limpa mensagens anteriores //
    if (loginButton.disabled) return; // Não permite o envio se o botão estiver desabilitado //

    const email = document.getElementById("email").value.trim(); //
    const password = document.getElementById("password").value.trim(); //

    if (!email || !password) { //
        errorMessage.textContent = "Preencha todos os campos."; //
        return; //
    } //

    try { //
        // Faz a requisição POST para o servidor com as chaves do dispositivo
        const data = await sendRequest(`${API_BASE_URL}/auth/login`, "POST", { //
            email, //
            password //
        }, false, true); // Não inclui Authorization (ainda não logado), mas inclui chaves do dispositivo //

        // Salva o token e informações do usuário no localStorage
        setLocalStorageItem("token", data.token); //
        setLocalStorageItem("userId", data.user.id); //
        setLocalStorageItem("user", JSON.stringify(data.user)); //

        // Atualiza as chaves do dispositivo, caso o backend tenha regenerado ou associado
        if (data.device_api_key) { //
            setLocalStorageItem("api_key", data.device_api_key); //
        } //
        if (data.device_cripto_key) { //
            setLocalStorageItem("cripto_key", data.device_cripto_key); //
        } //

        console.log("Login bem-sucedido! ID:", data.user.id); //
        resetLoginAttempts(); // Reseta as tentativas de login em caso de sucesso //
        
        // Redireciona para a página inicial do usuário
        window.location.href = "./homepage_user.html"; //

    } catch (error) { //
        console.error("Erro no login:", error); //
        
        if (error.status === 401) { //
            if (error.message === "Credenciais inválidas." || error.message === "API Key inválida ou não encontrada.") { //
                errorMessage.textContent = "Email ou senha inválidos. Por favor, tente novamente."; //
                incrementLoginAttempts(); // Incrementa tentativas em caso de credenciais inválidas //
            } else { //
                errorMessage.textContent = error.message; //
            } //
        } else if (error.status === 403) { //
            errorMessage.textContent = error.message; // Exibe a mensagem exata do backend para 403 //
        } else { //
            errorMessage.textContent = "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde."; //
        } //
    } //
});






// document.getElementById("loginForm").addEventListener("submit", async (event) => {
//     event.preventDefault(); // Previne o envio padrão do formulário

//     // Obtém os valores dos campos
//     const email = document.getElementById("email").value.trim();
//     const password = document.getElementById("password").value.trim();
//     const errorMessage = document.getElementById("errorMessage");

//     // Limpa mensagens anteriores
//     errorMessage.textContent = "";

//     // Validação básica de campos vazios
//     if (!email || !password) {
//         errorMessage.textContent = "Preencha todos os campos.";
//         return;
//     }

//     try {
//         // Faz a requisição POST para o servidor
//         const response = await fetch("http://localhost:3000/auth/login", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email, password }),
//         });

//         const data = await response.json(); // Converte a resposta em JSON

//         if (!response.ok) {
//             throw new Error(data.error || "Erro ao fazer login. Verifique suas credenciais.");
//         }

//         // Salva o token e informações do usuário no localStorage
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("userId", data.user.id);
//         localStorage.setItem("user", JSON.stringify(data.user));

//         console.log("Login bem-sucedido! ID:", data.user.id);
        
//         // Redireciona para a página inicial do usuário
//         window.location.href = "./homepage_user.html";

//     } catch (error) {
//         console.error("Erro no login:", error);
//         errorMessage.textContent = error.message;
//     }
// });
