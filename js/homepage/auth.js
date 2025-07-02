const API_BASE_URL = "http://localhost:3000"; // Defina a URL base da API

// auth.js
export function getUserIdFromToken() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Token não encontrado. Faça login.");
        return null;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
    } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        return null;
    }
}

export async function logout() {
    // PASSO 1: Obtenha as chaves necessárias *antes* de limpar o localStorage.
    // As variáveis 'token', 'apiKey', 'criptoKey' serão capturadas aqui
    // e usadas na requisição, mesmo que o localStorage seja limpo logo em seguida.
    const token = localStorage.getItem("token");
    const apiKey = localStorage.getItem("api_key"); // Assume que você está armazenando api_key
    const criptoKey = localStorage.getItem("cripto_key"); // Assume que você está armazenando cripto_key

    // PASSO 2: Limpa o localStorage IMEDIATAMENTE.
    // Isso garante que o estado local do navegador seja resetado primeiro.
    localStorage.clear();
    console.log("LocalStorage limpo localmente."); //

    // Se não havia token antes da limpeza, o usuário já estava "deslogado" localmente.
    // Ainda assim, redirecionamos para a página de login.
    if (!token) {
        console.warn("Nenhum token encontrado antes da limpeza. O usuário já estava desconectado localmente.");
        window.location.href = "../pages/login.html"; // Redireciona para a página de login
        return;
    }

    try {
        // PASSO 3: Tenta enviar a requisição de logout para o backend.
        // As variáveis (token, apiKey, criptoKey) usadas aqui são as que foram capturadas acima,
        // antes do localStorage ser limpo.
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                "X-API-Key": apiKey, // Inclui a api_key na requisição de logout
                "X-Encryption-Key-Id": criptoKey // Inclui a cripto_key na requisição de logout
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error("Erro ao fazer logout no backend:", errorData?.error || response.statusText);
            // Mesmo com erro no backend, o localStorage já foi limpo no frontend.
        } else {
            console.log("Logout bem-sucedido no backend.");
        }
    } catch (error) {
        console.error("Erro na requisição de logout:", error);
    } finally {
        // PASSO 4: Redireciona para a página de login, independentemente do sucesso
        // ou falha da requisição ao backend.
        window.location.href = "../pages/login.html"; // Redireciona para a página de login
    }

}