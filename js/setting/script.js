document.addEventListener("DOMContentLoaded", function () {
    // Base URL para suas requisições de API
    const API_BASE_URL = "http://localhost:3000"; // Defina se não estiver globalmente disponível

    const userId = localStorage.getItem("userId"); // Recupera o userId do localStorage
    console.log('user: ', userId);
    const token = localStorage.getItem("token"); // Recupera o token do localStorage
    const apiKey = localStorage.getItem("api_key"); // Nova: Recupera a api_key do localStorage
    const criptoKey = localStorage.getItem("cripto_key"); // Nova: Recupera a cripto_key do localStorage

    // Verificação aprimorada de autenticação e chaves de dispositivo
    if (!userId || !token || !apiKey || !criptoKey) {
        alert("Sessão expirada ou usuário não autenticado. Faça login novamente.");
        localStorage.clear(); // Garante a limpeza total
        window.location.href = "./login.html"; // Redireciona para a página de login
        return;
    }

    // Função para decodificar o token JWT
    function decodeToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            //console.log(payload);
            return payload;
        } catch (error) {
            console.error("Erro ao decodificar o token:", error);
            return null;
        }
    }

    // Verifica se o usuário é administrador
    const payload = decodeToken(token);
    console.log(payload.userType);
    if (payload && payload.userType === "Administrator") { // Altere "Administrator" para o valor correto, se necessário
        // Mostra a opção de administração no dropdown
        const adminOption = document.getElementById("admin-option");
        if (adminOption) {
            adminOption.style.display = "block";
        }
    }

    // Função para enviar requisições autenticadas e com chaves de dispositivo
    async function sendAuthenticatedRequest(url, method, body = null) {
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Inclui o token no cabeçalho
            "X-API-Key": apiKey, // Nova: Inclui a api_key do dispositivo
            "X-Encryption-Key-Id": criptoKey, // Nova: Inclui a cripto_key do dispositivo (se aplicável)
        };

        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body ? JSON.stringify(body) : null, // Envia o corpo da requisição, se houver
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null); // Captura erros de JSON inválido

            // Nova: Tratamento global para 401 Unauthorized e 403 Forbidden
            if (response.status === 401 || response.status === 403) {
                console.error(`Erro de autenticação/autorização (${response.status}):`, errorData?.error || "Token inválido ou sessão expirada.");
                alert("Sua sessão expirou ou foi encerrada. Por favor, faça login novamente.");
                localStorage.clear(); // Limpa todas as credenciais armazenadas
                window.location.href = "./login.html"; // Redireciona para a tela de login
                // Interrompe a execução posterior
                throw new Error("Redirecionando para login devido a erro de autenticação.");
            }

            throw new Error(errorData?.error || "Erro na requisição.");
        }

        try {
            return await response.json();
        } catch (error) {
            return null; // Retorna null se a resposta não tiver corpo JSON
        }
    }

    // Formulário de alteração do nome de usuário
    const usernameForm = document.getElementById("username-form");
    if (usernameForm) {
        usernameForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const newUsername = document.getElementById("new-username").value.trim();
            if (!newUsername) {
                alert("Por favor, digite um novo nome de usuário.");
                return;
            }

            try {
                const response = await sendAuthenticatedRequest(
                    `${API_BASE_URL}/users/${userId}`,
                    "PATCH",
                    { name: newUsername } // Corpo da requisição
                );

                // Verifica se a resposta do backend contém um novo token
                if (response && response.token) { // Adicionado 'response &&' para segurança
                    localStorage.setItem("token", response.token); // Atualiza o token no localStorage
                    alert("Nome de usuário atualizado com sucesso! Você foi reautenticado.");
                } else {
                    alert("Nome de usuário atualizado com sucesso!");
                }

                window.location.reload(); // Recarrega a página
            } catch (error) {
                console.error(error);
                alert("Erro ao atualizar o nome de usuário: " + error.message);
            }
        });
    }

    // Formulário de alteração de senha
    const passwordForm = document.getElementById("password-form");
    if (passwordForm) { // Adicionada verificação
        passwordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById("new-password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            // Verifica se a nova senha e a confirmação coincidem
            if (newPassword !== confirmPassword) {
                alert("As senhas não coincidem.");
                return;
            }

            // Se a nova senha e a confirmação coincidirem, prossegue com a alteração da senha
            try {
                const response = await sendAuthenticatedRequest(
                    `${API_BASE_URL}/users/${userId}`,
                    "PATCH",
                    { password: confirmPassword } // Corpo da requisição
                );

                // Verifica se a resposta do backend contém um novo token
                if (response && response.token) { // Adicionado 'response &&' para segurança
                    localStorage.setItem("token", response.token); // Atualiza o token no localStorage
                    alert("Senha alterada com sucesso! Você foi reautenticado.");
                } else {
                    alert("Senha alterada com sucesso!");
                }

                window.location.reload(); // Recarrega a página
            } catch (error) {
                console.error(error);
                alert(error.message); // Exibe a mensagem de erro do backend
            }
        });
    }


    // Botão de exclusão de conta
    const deleteAccountButton = document.getElementById("delete-account");
    if (deleteAccountButton) { // Adicionada verificação
        deleteAccountButton.addEventListener("click", async () => {
            const confirmDelete = confirm("Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.");

            if (confirmDelete) {
                try {
                    await sendAuthenticatedRequest(
                        `${API_BASE_URL}/users/${userId}`,
                        "DELETE"
                    );

                    alert("Conta deletada com sucesso!");
                    localStorage.clear(); // Limpa o localStorage
                    window.location.href = "./login.html"; // Redireciona para a página de login
                } catch (error) {
                    console.error(error);
                    alert(error.message);
                }
            }
        });
    }

    // Logout
    const logoutButton = document.getElementById("logout");
    if (logoutButton) { // Adicionada verificação
        logoutButton.addEventListener("click", async () => { // Adicionado 'async'
            // PASSO 1: Limpa o localStorage IMEDIATAMENTE.
            localStorage.clear(); //
            console.log("LocalStorage limpo localmente.");

            try {
                // PASSO 2: Tenta enviar a requisição de logout para o backend.
                // As variáveis 'token', 'apiKey', 'criptoKey' ainda estão disponíveis
                // neste escopo da função, mesmo após a limpeza do localStorage.
                await sendAuthenticatedRequest(`${API_BASE_URL}/auth/logout`, "POST"); //
                console.log("Logout bem-sucedido no backend.");
            } catch (error) {
                console.error("Erro ao fazer logout no backend (mas credenciais locais já foram limpas):", error);
                // O frontend já está limpo, então este erro no backend é secundário para o usuário.
            } finally {
                // PASSO 3: Redireciona para a página de login.
                window.location.href = "./login.html"; //
            }
        });
    }

    // Redirecionamento para a homepage
    const homepageLink = document.getElementById("homepage");
    if (homepageLink) { // Adicionada verificação
        homepageLink.addEventListener("click", () => {
            window.location.href = "./homepage_user.html";
        });
    }
});