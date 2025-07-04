document.addEventListener("DOMContentLoaded", function () {
    // Base URL para suas requisições de API
    const API_BASE_URL = "http://localhost:3000";

    // Recupera todas as credenciais do localStorage no carregamento da página.
    // Essas variáveis manterão seus valores para as funções definidas neste escopo,
    // mesmo que o localStorage seja limpo depois.
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const apiKey = localStorage.getItem("api_key");
    const criptoKey = localStorage.getItem("cripto_key");

    // Verifica se o usuário está autenticado e se as chaves do dispositivo existem
    if (!userId || !token || !apiKey || !criptoKey) {
        alert("Sessão expirada ou usuário não autenticado. Faça login novamente.");
        localStorage.clear(); // Garante a limpeza total
        window.location.href = "./login.html"; // Redireciona para a página de login
        return;
    }

    // Função para enviar requisições autenticadas e com chaves de dispositivo
    async function sendAuthenticatedRequest(url, method, body = null) {
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Inclui o token JWT no cabeçalho
            "X-API-Key": apiKey, // Inclui a api_key do dispositivo
            "X-Encryption-Key-Id": criptoKey, // Inclui a cripto_key do dispositivo (se aplicável)
        };

        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body ? JSON.stringify(body) : null, // Envia o corpo da requisição, se houver
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null); // Captura erros de JSON inválido

            // Tratamento global para 401 Unauthorized e 403 Forbidden
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

    // Função para carregar o histórico de acesso (existente)
    async function loadLogAccess() {
        try {
            const logs = await sendAuthenticatedRequest(`${API_BASE_URL}/logAccess`, "GET");
            console.log("Resposta da API (logAccess):", logs);
            renderLogAccess(logs);
        } catch (error) {
            console.error("Erro ao carregar histórico de acesso:", error);
            document.getElementById("logAccessTableBody").innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-danger">Erro ao carregar dados.</td>
                </tr>
            `;
        }
    }

    // Função para renderizar o histórico de acesso na tabela (existente)
    function renderLogAccess(logs) {
        const tableBody = document.getElementById("logAccessTableBody");
        tableBody.innerHTML = "";

        if (!logs || !Array.isArray(logs) || logs.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">Nenhum registro encontrado.</td>
                </tr>
            `;
            return;
        }

        logs.forEach(log => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${log.id || "N/A"}</td>
                <td>${log.catalog_id || "N/A"}</td>
                <td>${log.views || "N/A"}</td>
                <td>${log.updated_at ? new Date(log.updated_at).toLocaleString() : "N/A"}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Função para carregar o uso da API externa (existente)
    async function loadApiUsage() {
        try {
            const usage = await sendAuthenticatedRequest(`${API_BASE_URL}/api/external-api/usage`, "GET");
            console.log("Resposta da API (apiUsage):", usage);
            renderApiUsage(usage);
        } catch (error) {
            console.error("Erro ao carregar uso da API:", error);
            document.getElementById("apiUsage").innerHTML = `
                <div class="alert alert-danger">Erro ao carregar dados de uso da API.</div>
            `;
        }
    }

    // Função para renderizar o uso da API externa (existente)
    function renderApiUsage(usage) {
        const apiUsageElement = document.getElementById("apiUsage");
        apiUsageElement.innerHTML = "";

        if (!usage || !Array.isArray(usage) || usage.length === 0) {
            apiUsageElement.innerHTML = `
                <div class="alert alert-warning">Nenhum dado de uso da API encontrado.</div>
            `;
            return;
        }

        const usageList = document.createElement("ul");
        usageList.className = "list-group";

        usage.forEach(item => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item";
            listItem.innerHTML = `
                <strong>ID:</strong> ${item.id || "N/A"}<br>
                <strong>Fonte:</strong> ${item.source || "N/A"}<br>
                <strong>ID do Catálogo:</strong> ${item.catalog_id || "N/A"}<br>
                <strong>Sincronizado em:</strong> ${item.synced_at ? new Date(item.synced_at).toLocaleString() : "N/A"}
            `;
            usageList.appendChild(listItem);
        });

        apiUsageElement.appendChild(usageList);
    }

    // Função para buscar histórico de acesso por ID (existente)
    async function loadLogAccessById(id) {
        try {
            const log = await sendAuthenticatedRequest(`${API_BASE_URL}/logAccess/${id}`, "GET");
            console.log("Resposta da API (logAccessById):", log);
            renderLogAccessById(log);
        } catch (error) {
            console.error("Erro ao buscar histórico de acesso por ID:", error);
            document.getElementById("logAccessByIdResult").innerHTML = `
                <div class="alert alert-danger">Erro ao buscar histórico de acesso.</div>
            `;
        }
    }

    // Função para renderizar o histórico de acesso por ID (existente)
    function renderLogAccessById(log) {
        const resultElement = document.getElementById("logAccessByIdResult");
        resultElement.innerHTML = "";

        if (!log || !Array.isArray(log) || log.length === 0) {
            resultElement.innerHTML = `
                <div class="alert alert-warning">Nenhum registro encontrado para o ID fornecido.</div>
            `;
            return;
        }

        const logList = document.createElement("ul");
        logList.className = "list-group";

        log.forEach(item => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item";
            listItem.innerHTML = `
                <strong>ID:</strong> ${item.id || "N/A"}<br>
                <strong>ID do Catálogo:</strong> ${item.catalog_id || "N/A"}<br>
                <strong>Visualizações:</strong> ${item.views || "N/A"}<br>
                <strong>Atualizado em:</strong> ${item.updated_at ? new Date(item.updated_at).toLocaleString() : "N/A"}
            `;
            logList.appendChild(listItem);
        });

        resultElement.appendChild(logList);
    }

    // Função para buscar histórico de visualizações por ID (existente)
    async function loadHistoryById(id) {
        try {
            const history = await sendAuthenticatedRequest(`${API_BASE_URL}/history/${id}`, "GET");
            console.log("Resposta da API (historyById):", history);
            renderHistoryById(history);
        } catch (error) {
            console.error("Erro ao buscar histórico de visualizações por ID:", error);
            document.getElementById("historyByIdResult").innerHTML = `
                <div class="alert alert-danger">Erro ao buscar histórico de visualizações.</div>
            `;
        }
    }

    // Função para renderizar o histórico de visualizações por ID (existente)
    function renderHistoryById(history) {
        const resultElement = document.getElementById("historyByIdResult");
        resultElement.innerHTML = "";

        if (!history || !Array.isArray(history) || history.length === 0) {
            resultElement.innerHTML = `
                <div class="alert alert-warning">Nenhum registro encontrado para o ID fornecido.</div>
            `;
            return;
        }

        const historyList = document.createElement("ul");
        historyList.className = "list-group";

        history.forEach(item => {
            const listItem = document.createElement("li");
            listItem.className = "list-group-item";
            listItem.innerHTML = `
                <strong>ID:</strong> ${item.id || "N/A"}<br>
                <strong>ID do Usuário:</strong> ${item.user_id || "N/A"}<br>
                <strong>ID do Catálogo:</strong> ${item.catalog_id || "N/A"}<br>
                <strong>Assistido em:</strong> ${item.watched_at ? new Date(item.watched_at).toLocaleString() : "N/A"}
            `;
            historyList.appendChild(listItem);
        });

        resultElement.appendChild(historyList);
    }

    // --- Nova Função: Carregar Log de Atividades ---
    async function loadLogActivities() {
        try {
            // Assumindo que seu backend tem um endpoint para buscar todos os logs
            const logs = await sendAuthenticatedRequest(`${API_BASE_URL}/logAccess/All/logs`, "GET");
            console.log("Resposta da API (logActivities):", logs);
            renderLogActivities(logs);
        } catch (error) {
            console.error("Erro ao carregar log de atividades:", error);
            document.getElementById("logActivitiesTableBody").innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-danger">Erro ao carregar log de atividades.</td>
                </tr>
            `;
        }
    }

    // --- Nova Função: Renderizar Log de Atividades na Tabela ---
    function renderLogActivities(logs) {
        const tableBody = document.getElementById("logActivitiesTableBody");
        tableBody.innerHTML = "";

        if (!logs || !Array.isArray(logs) || logs.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">Nenhum registro de atividade encontrado.</td>
                </tr>
            `;
            return;
        }

        logs.forEach(log => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${log.id || "N/A"}</td>
                <td>${log.operacao || "N/A"}</td>
                <td>${log.descricao || "N/A"}</td>
                <td>${log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}</td>
                <td>${log.id_usuario || "N/A"}</td>
                <td>${log.ip || "N/A"}</td>
                <td>${log.user_agent || "N/A"}</td>
                <td>${log.status || "N/A"}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // ==================================================
    // Inicialização
    // ==================================================

    // Carrega o histórico de acesso, o uso da API e o log de atividades ao carregar a página
    loadLogAccess();
    loadApiUsage();
    loadLogActivities(); // Nova: Chama a função para carregar os logs

    // Evento de envio do formulário de busca de histórico de acesso por ID
    const logAccessByIdForm = document.getElementById("logAccessByIdForm");
    if (logAccessByIdForm) {
        logAccessByIdForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("logAccessId").value;
            if (!id) {
                alert("Por favor, insira um ID válido.");
                return;
            }
            await loadLogAccessById(id);
        });
    }

    // Evento de envio do formulário de busca de histórico de visualizações por ID
    const historyByIdForm = document.getElementById("historyByIdForm");
    if (historyByIdForm) {
        historyByIdForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("historyId").value;
            if (!id) {
                alert("Por favor, insira um ID válido.");
                return;
            }
            await loadHistoryById(id);
        });
    }

    // Logout
    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", async () => { // Adicionado 'async'
            // PASSO 1: Limpa o localStorage IMEDIATAMENTE.
            localStorage.clear();
            console.log("LocalStorage limpo localmente.");

            try {
                // PASSO 2: Tenta enviar a requisição de logout para o backend.
                // As variáveis 'token', 'apiKey', 'criptoKey' ainda estão disponíveis
                // neste escopo da função, mesmo após a limpeza do localStorage.
                await sendAuthenticatedRequest(`${API_BASE_URL}/auth/logout`, "POST");
                console.log("Logout bem-sucedido no backend.");
            } catch (error) {
                console.error("Erro ao fazer logout no backend (mas credenciais locais já foram limpas):", error);
                // O frontend já está limpo, então este erro no backend é secundário para o usuário.
            } finally {
                // PASSO 3: Redireciona para a página de login.
                window.location.href = "./login.html";
            }
        });
    }

    // Redirecionamento para a homepage
    const homepageLink = document.getElementById("homepage");
    if (homepageLink) {
        homepageLink.addEventListener("click", () => {
            window.location.href = "./homepage_user.html";
        });
    }

    // Função para decodificar o token JWT (existente)
    function decodeToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        } catch (error) {
            console.error("Erro ao decodificar o token:", error);
            return null;
        }
    }

    // Verifica se o usuário é administrador (existente)
    // Nota: Certifique-se de que o elemento com ID "admin-option" exista no seu HTML
    // se você espera que esta lógica funcione.
    const userPayload = decodeToken(token); // Renomeado para evitar conflito com 'payload' de outros scripts
    if (userPayload && userPayload.userType === "Administrator") {
        const adminOption = document.getElementById("admin-option");
        if (adminOption) {
            adminOption.style.display = "block"; // Ou remova 'display: none;' do CSS
        }
    }
});



// document.addEventListener("DOMContentLoaded", function () {
//     // Base URL para suas requisições de API
//     const API_BASE_URL = "http://localhost:3000";

//     // Recupera todas as credenciais do localStorage no carregamento da página.
//     // Essas variáveis manterão seus valores para as funções definidas neste escopo,
//     // mesmo que o localStorage seja limpo depois.
//     const userId = localStorage.getItem("userId");
//     const token = localStorage.getItem("token");
//     const apiKey = localStorage.getItem("api_key"); // Nova: Recupera a api_key
//     const criptoKey = localStorage.getItem("cripto_key"); // Nova: Recupera a cripto_key

//     // Verifica se o usuário está autenticado e se as chaves do dispositivo existem
//     if (!userId || !token || !apiKey || !criptoKey) { // Condição de verificação aprimorada
//         alert("Sessão expirada ou usuário não autenticado. Faça login novamente.");
//         localStorage.clear(); // Garante a limpeza total
//         window.location.href = "./login.html"; // Redireciona para a página de login
//         return;
//     }

//     // Função para enviar requisições autenticadas e com chaves de dispositivo
//     async function sendAuthenticatedRequest(url, method, body = null) {
//         const headers = {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`, // Inclui o token JWT no cabeçalho
//             "X-API-Key": apiKey, // Nova: Inclui a api_key do dispositivo
//             "X-Encryption-Key-Id": criptoKey, // Nova: Inclui a cripto_key do dispositivo (se aplicável)
//         };

//         const response = await fetch(url, {
//             method: method,
//             headers: headers,
//             body: body ? JSON.stringify(body) : null, // Envia o corpo da requisição, se houver
//         });

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => null); // Captura erros de JSON inválido

//             // Nova: Tratamento global para 401 Unauthorized e 403 Forbidden
//             if (response.status === 401 || response.status === 403) {
//                 console.error(`Erro de autenticação/autorização (${response.status}):`, errorData?.error || "Token inválido ou sessão expirada.");
//                 alert("Sua sessão expirou ou foi encerrada. Por favor, faça login novamente.");
//                 localStorage.clear(); // Limpa todas as credenciais armazenadas
//                 window.location.href = "./login.html"; // Redireciona para a tela de login
//                 // Interrompe a execução posterior
//                 throw new Error("Redirecionando para login devido a erro de autenticação.");
//             }

//             throw new Error(errorData?.error || "Erro na requisição.");
//         }

//         try {
//             return await response.json();
//         } catch (error) {
//             return null; // Retorna null se a resposta não tiver corpo JSON
//         }
//     }

//     // Função para carregar o histórico de acesso
//     async function loadLogAccess() {
//         try {
//             const logs = await sendAuthenticatedRequest(`${API_BASE_URL}/logAccess`, "GET");
//             console.log("Resposta da API (logAccess):", logs); // Inspeciona a resposta da API
//             renderLogAccess(logs);
//         } catch (error) {
//             console.error("Erro ao carregar histórico de acesso:", error);
//             document.getElementById("logAccessTableBody").innerHTML = `
//                 <tr>
//                     <td colspan="4" class="text-center text-danger">Erro ao carregar dados.</td>
//                 </tr>
//             `;
//         }
//     }

//     // Função para renderizar o histórico de acesso na tabela
//     function renderLogAccess(logs) {
//         const tableBody = document.getElementById("logAccessTableBody");
//         tableBody.innerHTML = "";

//         if (!logs || !Array.isArray(logs) || logs.length === 0) {
//             tableBody.innerHTML = `
//                 <tr>
//                     <td colspan="4" class="text-center">Nenhum registro encontrado.</td>
//                 </tr>
//             `;
//             return;
//         }

//         logs.forEach(log => {
//             const row = document.createElement("tr");
//             row.innerHTML = `
//                 <td>${log.id || "N/A"}</td>
//                 <td>${log.catalog_id || "N/A"}</td>
//                 <td>${log.views || "N/A"}</td>
//                 <td>${log.updated_at ? new Date(log.updated_at).toLocaleString() : "N/A"}</td>
//             `;
//             tableBody.appendChild(row);
//         });
//     }

//     // Função para carregar o uso da API externa
//     async function loadApiUsage() {
//         try {
//             const usage = await sendAuthenticatedRequest(`${API_BASE_URL}/api/external-api/usage`, "GET");
//             console.log("Resposta da API (apiUsage):", usage); // Inspeciona a resposta da API
//             renderApiUsage(usage);
//         } catch (error) {
//             console.error("Erro ao carregar uso da API:", error);
//             document.getElementById("apiUsage").innerHTML = `
//                 <div class="alert alert-danger">Erro ao carregar dados de uso da API.</div>
//             `;
//         }
//     }

//     // Função para renderizar o uso da API externa
//     function renderApiUsage(usage) {
//         const apiUsageElement = document.getElementById("apiUsage");
//         apiUsageElement.innerHTML = "";

//         if (!usage || !Array.isArray(usage) || usage.length === 0) {
//             apiUsageElement.innerHTML = `
//                 <div class="alert alert-warning">Nenhum dado de uso da API encontrado.</div>
//             `;
//             return;
//         }

//         const usageList = document.createElement("ul");
//         usageList.className = "list-group";

//         usage.forEach(item => {
//             const listItem = document.createElement("li");
//             listItem.className = "list-group-item";
//             listItem.innerHTML = `
//                 <strong>ID:</strong> ${item.id || "N/A"}<br>
//                 <strong>Fonte:</strong> ${item.source || "N/A"}<br>
//                 <strong>ID do Catálogo:</strong> ${item.catalog_id || "N/A"}<br>
//                 <strong>Sincronizado em:</strong> ${item.synced_at ? new Date(item.synced_at).toLocaleString() : "N/A"}
//             `;
//             usageList.appendChild(listItem);
//         });

//         apiUsageElement.appendChild(usageList);
//     }

//     // Função para buscar histórico de acesso por ID
//     async function loadLogAccessById(id) {
//         try {
//             const log = await sendAuthenticatedRequest(`${API_BASE_URL}/logAccess/${id}`, "GET");
//             console.log("Resposta da API (logAccessById):", log); // Inspeciona a resposta da API
//             renderLogAccessById(log);
//         } catch (error) {
//             console.error("Erro ao buscar histórico de acesso por ID:", error);
//             document.getElementById("logAccessByIdResult").innerHTML = `
//                 <div class="alert alert-danger">Erro ao buscar histórico de acesso.</div>
//             `;
//         }
//     }

//     // Função para renderizar o histórico de acesso por ID
//     function renderLogAccessById(log) {
//         const resultElement = document.getElementById("logAccessByIdResult");
//         resultElement.innerHTML = "";

//         if (!log || !Array.isArray(log) || log.length === 0) {
//             resultElement.innerHTML = `
//                 <div class="alert alert-warning">Nenhum registro encontrado para o ID fornecido.</div>
//             `;
//             return;
//         }

//         const logList = document.createElement("ul");
//         logList.className = "list-group";

//         log.forEach(item => {
//             const listItem = document.createElement("li");
//             listItem.className = "list-group-item";
//             listItem.innerHTML = `
//                 <strong>ID:</strong> ${item.id || "N/A"}<br>
//                 <strong>ID do Catálogo:</strong> ${item.catalog_id || "N/A"}<br>
//                 <strong>Visualizações:</strong> ${item.views || "N/A"}<br>
//                 <strong>Atualizado em:</strong> ${item.updated_at ? new Date(item.updated_at).toLocaleString() : "N/A"}
//             `;
//             logList.appendChild(listItem);
//         });

//         resultElement.appendChild(logList);
//     }

//     // Função para buscar histórico de visualizações por ID
//     async function loadHistoryById(id) {
//         try {
//             const history = await sendAuthenticatedRequest(`${API_BASE_URL}/history/${id}`, "GET");
//             console.log("Resposta da API (historyById):", history); // Inspeciona a resposta da API
//             renderHistoryById(history);
//         } catch (error) {
//             console.error("Erro ao buscar histórico de visualizações por ID:", error);
//             document.getElementById("historyByIdResult").innerHTML = `
//                 <div class="alert alert-danger">Erro ao buscar histórico de visualizações.</div>
//             `;
//         }
//     }

//     // Função para renderizar o histórico de visualizações por ID
//     function renderHistoryById(history) {
//         const resultElement = document.getElementById("historyByIdResult");
//         resultElement.innerHTML = "";

//         if (!history || !Array.isArray(history) || history.length === 0) {
//             resultElement.innerHTML = `
//                 <div class="alert alert-warning">Nenhum registro encontrado para o ID fornecido.</div>
//             `;
//             return;
//         }

//         const historyList = document.createElement("ul");
//         historyList.className = "list-group";

//         history.forEach(item => {
//             const listItem = document.createElement("li");
//             listItem.className = "list-group-item";
//             listItem.innerHTML = `
//                 <strong>ID:</strong> ${item.id || "N/A"}<br>
//                 <strong>ID do Usuário:</strong> ${item.user_id || "N/A"}<br>
//                 <strong>ID do Catálogo:</strong> ${item.catalog_id || "N/A"}<br>
//                 <strong>Assistido em:</strong> ${item.watched_at ? new Date(item.watched_at).toLocaleString() : "N/A"}
//             `;
//             historyList.appendChild(listItem);
//         });

//         resultElement.appendChild(historyList);
//     }

//     // ==================================================
//     // Inicialização
//     // ==================================================

//     // Carrega o histórico de acesso e o uso da API ao carregar a página
//     loadLogAccess();
//     loadApiUsage();

//     // Evento de envio do formulário de busca de histórico de acesso por ID
//     const logAccessByIdForm = document.getElementById("logAccessByIdForm");
//     if (logAccessByIdForm) {
//         logAccessByIdForm.addEventListener("submit", async (e) => {
//             e.preventDefault();
//             const id = document.getElementById("logAccessId").value;
//             if (!id) {
//                 alert("Por favor, insira um ID válido.");
//                 return;
//             }
//             await loadLogAccessById(id);
//         });
//     }

//     // Evento de envio do formulário de busca de histórico de visualizações por ID
//     const historyByIdForm = document.getElementById("historyByIdForm");
//     if (historyByIdForm) {
//         historyByIdForm.addEventListener("submit", async (e) => {
//             e.preventDefault();
//             const id = document.getElementById("historyId").value;
//             if (!id) {
//                 alert("Por favor, insira um ID válido.");
//                 return;
//             }
//             await loadHistoryById(id);
//         });
//     }

//     // Logout
//     const logoutButton = document.getElementById("logout");
//     if (logoutButton) {
//         logoutButton.addEventListener("click", async () => { // Adicionado 'async'
//             // PASSO 1: Limpa o localStorage IMEDIATAMENTE.
//             localStorage.clear();
//             console.log("LocalStorage limpo localmente.");

//             try {
//                 // PASSO 2: Tenta enviar a requisição de logout para o backend.
//                 // As variáveis 'token', 'apiKey', 'criptoKey' ainda estão disponíveis
//                 // neste escopo da função, mesmo após a limpeza do localStorage.
//                 await sendAuthenticatedRequest(`${API_BASE_URL}/auth/logout`, "POST");
//                 console.log("Logout bem-sucedido no backend.");
//             } catch (error) {
//                 console.error("Erro ao fazer logout no backend (mas credenciais locais já foram limpas):", error);
//                 // O frontend já está limpo, então este erro no backend é secundário para o usuário.
//             } finally {
//                 // PASSO 3: Redireciona para a página de login.
//                 window.location.href = "./login.html";
//             }
//         });
//     }

//     // Redirecionamento para a homepage
//     const homepageLink = document.getElementById("homepage");
//     if (homepageLink) {
//         homepageLink.addEventListener("click", () => {
//             window.location.href = "./homepage_user.html";
//         });
//     }

//     // Verifica se o usuário é administrador
//     const payload = decodeToken(token);
//     if (payload && payload.userType === "Administrator") { // Altere "Administrator" para o valor correto, se necessário
//         // Mostra a opção de administração no dropdown
//         const adminOption = document.getElementById("admin-option");
//         if (adminOption) {
//             adminOption.style.display = "block";
//         }
//     }

//     // Função para decodificar o token JWT
//     function decodeToken(token) {
//         try {
//             const payload = JSON.parse(atob(token.split('.')[1]));
//             return payload;
//         } catch (error) {
//             console.error("Erro ao decodificar o token:", error);
//             return null;
//         }
//     }
// });




// document.addEventListener("DOMContentLoaded", function () {
//     const userId = localStorage.getItem("userId"); // Recupera o userId do localStorage
//     const token = localStorage.getItem("token"); // Recupera o token do localStorage

//     if (!userId || !token) {
//         alert("Usuário não autenticado. Faça login novamente.");
//         window.location.href = "./login.html"; // Redireciona para a página de login
//         return;
//     }

//     // Função para enviar requisições autenticadas
//     async function sendAuthenticatedRequest(url, method, body = null) {
//         const headers = {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`, // Inclui o token no cabeçalho
//         };

//         const response = await fetch(url, {
//             method: method,
//             headers: headers,
//             body: body ? JSON.stringify(body) : null, // Envia o corpo da requisição, se houver
//         });

//         if (!response.ok) {
//             const errorData = await response.json().catch(() => null); // Captura erros de JSON inválido
//             throw new Error(errorData?.error || "Erro na requisição.");
//         }

//         try {
//             return await response.json();
//         } catch (error) {
//             return null; // Retorna null se a resposta não tiver corpo JSON
//         }
//     }

//     // Função para carregar o histórico de acesso
//     async function loadLogAccess() {
//         try {
//             const logs = await sendAuthenticatedRequest("http://localhost:3000/logAccess", "GET");
//             console.log("Resposta da API (logAccess):", logs); // Inspeciona a resposta da API
//             renderLogAccess(logs);
//         } catch (error) {
//             console.error("Erro ao carregar histórico de acesso:", error);
//             document.getElementById("logAccessTableBody").innerHTML = `
//                 <tr>
//                     <td colspan="4" class="text-center text-danger">Erro ao carregar dados.</td>
//                 </tr>
//             `;
//         }
//     }

//     // Função para renderizar o histórico de acesso na tabela
//     function renderLogAccess(logs) {
//         const tableBody = document.getElementById("logAccessTableBody");
//         tableBody.innerHTML = "";

//         if (!logs || !Array.isArray(logs) || logs.length === 0) {
//             tableBody.innerHTML = `
//                 <tr>
//                     <td colspan="4" class="text-center">Nenhum registro encontrado.</td>
//                 </tr>
//             `;
//             return;
//         }

//         logs.forEach(log => {
//             const row = document.createElement("tr");
//             row.innerHTML = `
//                 <td>${log.id || "N/A"}</td>
//                 <td>${log.catalog_id || "N/A"}</td>
//                 <td>${log.views || "N/A"}</td>
//                 <td>${log.updated_at ? new Date(log.updated_at).toLocaleString() : "N/A"}</td>
//             `;
//             tableBody.appendChild(row);
//         });
//     }

//     // Função para carregar o uso da API externa
//     async function loadApiUsage() {
//         try {
//             const usage = await sendAuthenticatedRequest("http://localhost:3000/api/external-api/usage", "GET");
//             console.log("Resposta da API (apiUsage):", usage); // Inspeciona a resposta da API
//             renderApiUsage(usage);
//         } catch (error) {
//             console.error("Erro ao carregar uso da API:", error);
//             document.getElementById("apiUsage").innerHTML = `
//                 <div class="alert alert-danger">Erro ao carregar dados de uso da API.</div>
//             `;
//         }
//     }

//     // Função para renderizar o uso da API externa
//     function renderApiUsage(usage) {
//         const apiUsageElement = document.getElementById("apiUsage");
//         apiUsageElement.innerHTML = "";

//         if (!usage || !Array.isArray(usage) || usage.length === 0) {
//             apiUsageElement.innerHTML = `
//                 <div class="alert alert-warning">Nenhum dado de uso da API encontrado.</div>
//             `;
//             return;
//         }

//         const usageList = document.createElement("ul");
//         usageList.className = "list-group";

//         usage.forEach(item => {
//             const listItem = document.createElement("li");
//             listItem.className = "list-group-item";
//             listItem.innerHTML = `
//                 <strong>ID:</strong> ${item.id || "N/A"}<br>
//                 <strong>Fonte:</strong> ${item.source || "N/A"}<br>
//                 <strong>ID do Catálogo:</strong> ${item.catalog_id || "N/A"}<br>
//                 <strong>Sincronizado em:</strong> ${item.synced_at ? new Date(item.synced_at).toLocaleString() : "N/A"}
//             `;
//             usageList.appendChild(listItem);
//         });

//         apiUsageElement.appendChild(usageList);
//     }

//     // Função para buscar histórico de acesso por ID
//     async function loadLogAccessById(id) {
//         try {
//             const log = await sendAuthenticatedRequest(`http://localhost:3000/logAccess/${id}`, "GET");
//             console.log("Resposta da API (logAccessById):", log); // Inspeciona a resposta da API
//             renderLogAccessById(log);
//         } catch (error) {
//             console.error("Erro ao buscar histórico de acesso por ID:", error);
//             document.getElementById("logAccessByIdResult").innerHTML = `
//                 <div class="alert alert-danger">Erro ao buscar histórico de acesso.</div>
//             `;
//         }
//     }

//     // Função para renderizar o histórico de acesso por ID
//     function renderLogAccessById(log) {
//         const resultElement = document.getElementById("logAccessByIdResult");
//         resultElement.innerHTML = "";

//         if (!log || !Array.isArray(log) || log.length === 0) {
//             resultElement.innerHTML = `
//                 <div class="alert alert-warning">Nenhum registro encontrado para o ID fornecido.</div>
//             `;
//             return;
//         }

//         const logList = document.createElement("ul");
//         logList.className = "list-group";

//         log.forEach(item => {
//             const listItem = document.createElement("li");
//             listItem.className = "list-group-item";
//             listItem.innerHTML = `
//                 <strong>ID:</strong> ${item.id || "N/A"}<br>
//                 <strong>ID do Catálogo:</strong> ${item.catalog_id || "N/A"}<br>
//                 <strong>Visualizações:</strong> ${item.views || "N/A"}<br>
//                 <strong>Atualizado em:</strong> ${item.updated_at ? new Date(item.updated_at).toLocaleString() : "N/A"}
//             `;
//             logList.appendChild(listItem);
//         });

//         resultElement.appendChild(logList);
//     }

//     // Função para buscar histórico de visualizações por ID
//     async function loadHistoryById(id) {
//         try {
//             const history = await sendAuthenticatedRequest(`http://localhost:3000/history/${id}`, "GET");
//             console.log("Resposta da API (historyById):", history); // Inspeciona a resposta da API
//             renderHistoryById(history);
//         } catch (error) {
//             console.error("Erro ao buscar histórico de visualizações por ID:", error);
//             document.getElementById("historyByIdResult").innerHTML = `
//                 <div class="alert alert-danger">Erro ao buscar histórico de visualizações.</div>
//             `;
//         }
//     }

//     // Função para renderizar o histórico de visualizações por ID
//     function renderHistoryById(history) {
//         const resultElement = document.getElementById("historyByIdResult");
//         resultElement.innerHTML = "";

//         if (!history || !Array.isArray(history) || history.length === 0) {
//             resultElement.innerHTML = `
//                 <div class="alert alert-warning">Nenhum registro encontrado para o ID fornecido.</div>
//             `;
//             return;
//         }

//         const historyList = document.createElement("ul");
//         historyList.className = "list-group";

//         history.forEach(item => {
//             const listItem = document.createElement("li");
//             listItem.className = "list-group-item";
//             listItem.innerHTML = `
//                 <strong>ID:</strong> ${item.id || "N/A"}<br>
//                 <strong>ID do Usuário:</strong> ${item.user_id || "N/A"}<br>
//                 <strong>ID do Catálogo:</strong> ${item.catalog_id || "N/A"}<br>
//                 <strong>Assistido em:</strong> ${item.watched_at ? new Date(item.watched_at).toLocaleString() : "N/A"}
//             `;
//             historyList.appendChild(listItem);
//         });

//         resultElement.appendChild(historyList);
//     }

//     // ==================================================
//     // Inicialização
//     // ==================================================

//     // Carrega o histórico de acesso e o uso da API ao carregar a página
//     loadLogAccess();
//     loadApiUsage();

//     // Evento de envio do formulário de busca de histórico de acesso por ID
//     const logAccessByIdForm = document.getElementById("logAccessByIdForm");
//     if (logAccessByIdForm) {
//         logAccessByIdForm.addEventListener("submit", async (e) => {
//             e.preventDefault();
//             const id = document.getElementById("logAccessId").value;
//             if (!id) {
//                 alert("Por favor, insira um ID válido.");
//                 return;
//             }
//             await loadLogAccessById(id);
//         });
//     }

//     // Evento de envio do formulário de busca de histórico de visualizações por ID
//     const historyByIdForm = document.getElementById("historyByIdForm");
//     if (historyByIdForm) {
//         historyByIdForm.addEventListener("submit", async (e) => {
//             e.preventDefault();
//             const id = document.getElementById("historyId").value;
//             if (!id) {
//                 alert("Por favor, insira um ID válido.");
//                 return;
//             }
//             await loadHistoryById(id);
//         });
//     }

//     // Logout
//     const logoutButton = document.getElementById("logout");
//     if (logoutButton) {
//         logoutButton.addEventListener("click", () => {
//             localStorage.clear(); // Limpa o localStorage
//             window.location.href = "./login.html"; // Redireciona para a página de login
//         });
//     }

//     // Redirecionamento para a homepage
//     const homepageLink = document.getElementById("homepage");
//     if (homepageLink) {
//         homepageLink.addEventListener("click", () => {
//             window.location.href = "./homepage_user.html";
//         });
//     }

//     // Verifica se o usuário é administrador
//     const payload = decodeToken(token);
//     if (payload && payload.userType === "Administrator") { // Altere "Administrator" para o valor correto, se necessário
//         // Mostra a opção de administração no dropdown
//         const adminOption = document.getElementById("admin-option");
//         if (adminOption) {
//             adminOption.style.display = "block";
//         }
//     }

//     // Função para decodificar o token JWT
//     function decodeToken(token) {
//         try {
//             const payload = JSON.parse(atob(token.split('.')[1]));
//             return payload;
//         } catch (error) {
//             console.error("Erro ao decodificar o token:", error);
//             return null;
//         }
//     }
// });
