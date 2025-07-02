document.addEventListener("DOMContentLoaded", function () {
    // Base URL para suas requisições de API
    const API_BASE_URL = "http://localhost:3000";

    // Recupera as credenciais do localStorage no carregamento da página.
    // Essas variáveis manterão seus valores para as funções definidas neste escopo,
    // mesmo que o localStorage seja limpo depois.
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const apiKey = localStorage.getItem("api_key");
    const criptoKey = localStorage.getItem("cripto_key");

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
            "X-Encryption-Key-Id": criptoKey, // Inclui a cripto_key do dispositivo (se aplicável para o backend)
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

    // ==================================================
    // Gerenciamento de Conteúdos
    // ==================================================

    const contentForm = document.getElementById("content-form");
    const contentTableBody = document.getElementById("content-table-body");

    // Função para carregar todos os conteúdos
    async function loadContents() {
        try {
            const contents = await sendAuthenticatedRequest(`${API_BASE_URL}/catalog`, "GET");
            renderContents(contents);
        } catch (error) {
            console.error("Erro ao carregar conteúdos:", error);
            alert("Erro ao carregar conteúdos. Verifique o console para mais detalhes.");
        }
    }

    // Função para renderizar conteúdos na tabela
    function renderContents(contents) {
        contentTableBody.innerHTML = ""; // Limpa a tabela

        contents.forEach(content => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${content.id}</td>
                <td>${content.title}</td>
                <td>${content.genre}</td>
                <td>${content.content_type}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-content" data-id="${content.id}">Editar</button>
                    <button class="btn btn-danger btn-sm delete-content" data-id="${content.id}">Excluir</button>
                </td>
            `;
            contentTableBody.appendChild(row);
        });

        // Adiciona eventos aos botões de editar e excluir
        document.querySelectorAll(".edit-content").forEach(button => {
            button.addEventListener("click", () => editContent(button.dataset.id));
        });

        document.querySelectorAll(".delete-content").forEach(button => {
            button.addEventListener("click", () => deleteContent(button.dataset.id));
        });
    }

    // Função para editar conteúdo
    async function editContent(contentId) {
        try {
            const content = await sendAuthenticatedRequest(`${API_BASE_URL}/catalog/${contentId}`, "GET");

            // Preenche o formulário com os dados do conteúdo
            document.getElementById("content-title").value = content.title;
            document.getElementById("content-description").value = content.description;
            document.getElementById("content-genre").value = content.genre;
            document.getElementById("content-type").value = content.content_type;
            document.getElementById("content-video-url").value = content.video_url;

            // Altera o botão do formulário para "Atualizar"
            contentForm.querySelector("button").textContent = "Atualizar Conteúdo";
            contentForm.dataset.contentId = contentId; // Armazena o ID do conteúdo no formulário

            // Busca o poster do filme com base no título
            const posterUrl = await fetchPoster(content.title);
            if (posterUrl) {
                // Atualiza o campo de poster no formulário (se houver)
                document.getElementById("content-poster-url").value = posterUrl;
            }

        } catch (error) {
            console.error("Erro ao carregar conteúdo:", error);
            alert("Erro ao carregar conteúdo. Verifique o console para mais detalhes.");
        }
    }

    async function fetchPoster(title) {
        try {
            console.log(`Buscando poster para o filme: ${title}`);
            const response = await fetch(`${API_BASE_URL}/api/external-api/movie-poster?title=${encodeURIComponent(title)}`);
            
            // Verifica se a resposta foi bem-sucedida
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
            }
    
            // Tenta parsear a resposta como JSON
            const data = await response.json();
    
            // Verifica se a resposta contém o campo poster_url
            if (!data.poster_url) {
                throw new Error("URL do poster não encontrada na resposta.");
            }
    
            return data.poster_url; // Retorna a URL do poster
        } catch (error) {
            console.error("Erro ao buscar poster:", error);
            return null; // Retorna null em caso de erro
        }
    }

    // Função para excluir conteúdo
    async function deleteContent(contentId) {
        const confirmDelete = confirm("Tem certeza que deseja excluir este conteúdo?");

        if (confirmDelete) {
            try {
                await sendAuthenticatedRequest(`${API_BASE_URL}/catalog/${contentId}`, "DELETE");
                alert("Conteúdo excluído com sucesso!");
                loadContents(); // Recarrega a lista de conteúdos
            } catch (error) {
                console.error("Erro ao excluir conteúdo:", error);
                alert("Erro ao excluir conteúdo. Verifique o console para mais detalhes.");
            }
        }
    }

    // Evento de envio do formulário de conteúdo
    contentForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const contentId = contentForm.dataset.contentId; // Verifica se é uma edição
        const method = contentId ? "PATCH" : "POST"; // Define o método HTTP
        const url = contentId ? `${API_BASE_URL}/catalog/${contentId}` : `${API_BASE_URL}/catalog/addCatalog`;

        const contentData = {
            title: document.getElementById("content-title").value,
            description: document.getElementById("content-description").value,
            genre: document.getElementById("content-genre").value,
            content_type: document.getElementById("content-type").value,
            video_url: document.getElementById("content-video-url").value,
            poster_url: document.getElementById("content-poster-url").value, // Inclui o poster_url
        };

        try {
            await sendAuthenticatedRequest(url, method, contentData);
            alert(contentId ? "Conteúdo atualizado com sucesso!" : "Conteúdo adicionado com sucesso!");
            contentForm.reset(); // Limpa o formulário
            delete contentForm.dataset.contentId; // Remove o ID do conteúdo
            loadContents(); // Recarrega a lista de conteúdos
        } catch (error) {
            console.error("Erro ao salvar conteúdo:", error);
            alert("Erro ao salvar conteúdo. Verifique o console para mais detalhes.");
        }
    });

    const posterPreview = document.getElementById("poster-preview");

    document.getElementById("content-title").addEventListener("input", async (e) => {
        const title = e.target.value.trim();
        if (title) {
            try {
                const posterUrl = await fetchPoster(title);
                if (posterUrl) {
                    document.getElementById("content-poster-url").value = posterUrl;
                    posterPreview.src = posterUrl;
                    posterPreview.style.display = "block"; // Exibe a imagem
                } else {
                    posterPreview.style.display = "none"; // Oculta a imagem se não houver poster
                }
            } catch (error) {
                console.error("Erro ao buscar poster:", error);
                posterPreview.style.display = "none"; // Oculta a imagem em caso de erro
            }
        }
    });

    // ==================================================
    // Gerenciamento de Usuários
    // ==================================================

    const userSearchForm = document.getElementById("user-search-form");
    const userTableBody = document.getElementById("user-table-body");

    // Função para carregar todos os usuários
    async function loadUsers() {
        try {
            const users = await sendAuthenticatedRequest(`${API_BASE_URL}/users`, "GET");
            renderUsers(users);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            alert("Erro ao carregar usuários. Verifique o console para mais detalhes.");
        }
    }

    // Função para renderizar usuários na tabela
    function renderUsers(users) {
        userTableBody.innerHTML = ""; // Limpa a tabela

        users.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.user_type}</td>
                <td>
                    <button class="btn btn-danger btn-sm delete-user" data-id="${user.id}">Excluir</button>
                </td>
            `;
            userTableBody.appendChild(row);
        });

        // Adiciona eventos aos botões de exclusão de usuários
        document.querySelectorAll(".delete-user").forEach(button => {
            button.addEventListener("click", () => deleteUser(button.dataset.id));
        });
    }

    // Função para excluir usuário
    async function deleteUser(userId) {
        const confirmDelete = confirm("Tem certeza que deseja excluir este usuário?");

        if (confirmDelete) {
            try {
                await sendAuthenticatedRequest(`${API_BASE_URL}/users/${userId}`, "DELETE");
                alert("Usuário excluído com sucesso!");
                loadUsers(); // Recarrega a lista de usuários
            }
            catch (error) {
                console.error("Erro ao excluir usuário:", error);
                alert("Erro ao excluir usuário. Verifique o console para mais detalhes.");
            }
        }
    }

    // Evento de envio do formulário de busca de usuários
    userSearchForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const searchTerm = document.getElementById("user-search").value;

        if (!searchTerm) {
            alert("Digite um termo de busca (ID, nome ou e-mail).");
            return;
        }

        try {
            // Envia o termo de busca como parâmetro de consulta
            const users = await sendAuthenticatedRequest(
                `${API_BASE_URL}/users/search?name=${encodeURIComponent(searchTerm)}`,
                "GET"
            );
            renderUsers(users);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            alert("Erro ao buscar usuários. Verifique o console para mais detalhes.");
        }
    });

    // ==================================================
    // Inicialização
    // ==================================================

    // Carrega os conteúdos e usuários ao carregar a página
    loadContents();
    loadUsers();

    // Logout
    const logoutButton = document.getElementById("logout");
    logoutButton.addEventListener("click", async () => {
        // PASSO 1: Limpa o localStorage IMEDIATAMENTE.
        localStorage.clear();
        console.log("LocalStorage limpo localmente."); //

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

    // Redirecionamento para a homepage
    const homepageLink = document.getElementById("homepage");
    homepageLink.addEventListener("click", () => {
        window.location.href = "./homepage_user.html";
    });
});










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

//     // ==================================================
//     // Gerenciamento de Conteúdos
//     // ==================================================

//     const contentForm = document.getElementById("content-form");
//     const contentTableBody = document.getElementById("content-table-body");

//     // Função para carregar todos os conteúdos
//     async function loadContents() {
//         try {
//             const contents = await sendAuthenticatedRequest("http://localhost:3000/catalog", "GET");
//             renderContents(contents);
//         } catch (error) {
//             console.error("Erro ao carregar conteúdos:", error);
//             alert("Erro ao carregar conteúdos. Verifique o console para mais detalhes.");
//         }
//     }

//     // Função para renderizar conteúdos na tabela
//     function renderContents(contents) {
//         contentTableBody.innerHTML = ""; // Limpa a tabela

//         contents.forEach(content => {
//             const row = document.createElement("tr");
//             row.innerHTML = `
//                 <td>${content.id}</td>
//                 <td>${content.title}</td>
//                 <td>${content.genre}</td>
//                 <td>${content.content_type}</td>
//                 <td>
//                     <button class="btn btn-warning btn-sm edit-content" data-id="${content.id}">Editar</button>
//                     <button class="btn btn-danger btn-sm delete-content" data-id="${content.id}">Excluir</button>
//                 </td>
//             `;
//             contentTableBody.appendChild(row);
//         });

//         // Adiciona eventos aos botões de editar e excluir
//         document.querySelectorAll(".edit-content").forEach(button => {
//             button.addEventListener("click", () => editContent(button.dataset.id));
//         });

//         document.querySelectorAll(".delete-content").forEach(button => {
//             button.addEventListener("click", () => deleteContent(button.dataset.id));
//         });
//     }

//     // Função para editar conteúdo
//     async function editContent(contentId) {
//         try {
//             const content = await sendAuthenticatedRequest(`http://localhost:3000/catalog/${contentId}`, "GET");

//             // Preenche o formulário com os dados do conteúdo
//             document.getElementById("content-title").value = content.title;
//             document.getElementById("content-description").value = content.description;
//             document.getElementById("content-genre").value = content.genre;
//             document.getElementById("content-type").value = content.content_type;
//             document.getElementById("content-video-url").value = content.video_url;

//             // Altera o botão do formulário para "Atualizar"
//             contentForm.querySelector("button").textContent = "Atualizar Conteúdo";
//             contentForm.dataset.contentId = contentId; // Armazena o ID do conteúdo no formulário

//             // Busca o poster do filme com base no título
//             const posterUrl = await fetchPoster(content.title);
//             if (posterUrl) {
//                 // Atualiza o campo de poster no formulário (se houver)
//                 document.getElementById("content-poster-url").value = posterUrl;
//             }

//         } catch (error) {
//             console.error("Erro ao carregar conteúdo:", error);
//             alert("Erro ao carregar conteúdo. Verifique o console para mais detalhes.");
//         }
//     }

//     async function fetchPoster(title) {
//         try {
//             console.log(`Buscando poster para o filme: ${title}`);
//             const response = await fetch(`http://localhost:3000/api/external-api/movie-poster?title=${encodeURIComponent(title)}`);
            
//             // Verifica se a resposta foi bem-sucedida
//             if (!response.ok) {
//                 throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
//             }
    
//             // Tenta parsear a resposta como JSON
//             const data = await response.json();
    
//             // Verifica se a resposta contém o campo poster_url
//             if (!data.poster_url) {
//                 throw new Error("URL do poster não encontrada na resposta.");
//             }
    
//             return data.poster_url; // Retorna a URL do poster
//         } catch (error) {
//             console.error("Erro ao buscar poster:", error);
//             return null; // Retorna null em caso de erro
//         }
//     }

//     // Função para excluir conteúdo
//     async function deleteContent(contentId) {
//         const confirmDelete = confirm("Tem certeza que deseja excluir este conteúdo?");

//         if (confirmDelete) {
//             try {
//                 await sendAuthenticatedRequest(`http://localhost:3000/catalog/${contentId}`, "DELETE");
//                 alert("Conteúdo excluído com sucesso!");
//                 loadContents(); // Recarrega a lista de conteúdos
//             } catch (error) {
//                 console.error("Erro ao excluir conteúdo:", error);
//                 alert("Erro ao excluir conteúdo. Verifique o console para mais detalhes.");
//             }
//         }
//     }

//     // Evento de envio do formulário de conteúdo
//     contentForm.addEventListener("submit", async (e) => {
//         e.preventDefault();

//         const contentId = contentForm.dataset.contentId; // Verifica se é uma edição
//         const method = contentId ? "PATCH" : "POST"; // Define o método HTTP
//         const url = contentId ? `http://localhost:3000/catalog/${contentId}` : "http://localhost:3000/catalog/addCatalog";

//         const contentData = {
//             title: document.getElementById("content-title").value,
//             description: document.getElementById("content-description").value,
//             genre: document.getElementById("content-genre").value,
//             content_type: document.getElementById("content-type").value,
//             video_url: document.getElementById("content-video-url").value,
//             poster_url: document.getElementById("content-poster-url").value, // Inclui o poster_url
//         };

//         try {
//             await sendAuthenticatedRequest(url, method, contentData);
//             alert(contentId ? "Conteúdo atualizado com sucesso!" : "Conteúdo adicionado com sucesso!");
//             contentForm.reset(); // Limpa o formulário
//             delete contentForm.dataset.contentId; // Remove o ID do conteúdo
//             loadContents(); // Recarrega a lista de conteúdos
//         } catch (error) {
//             console.error("Erro ao salvar conteúdo:", error);
//             alert("Erro ao salvar conteúdo. Verifique o console para mais detalhes.");
//         }
//     });

//     const posterPreview = document.getElementById("poster-preview");

//     document.getElementById("content-title").addEventListener("input", async (e) => {
//         const title = e.target.value.trim();
//         if (title) {
//             try {
//                 const posterUrl = await fetchPoster(title);
//                 if (posterUrl) {
//                     document.getElementById("content-poster-url").value = posterUrl;
//                     posterPreview.src = posterUrl;
//                     posterPreview.style.display = "block"; // Exibe a imagem
//                 } else {
//                     posterPreview.style.display = "none"; // Oculta a imagem se não houver poster
//                 }
//             } catch (error) {
//                 console.error("Erro ao buscar poster:", error);
//                 posterPreview.style.display = "none"; // Oculta a imagem em caso de erro
//             }
//         }
//     });

//     // ==================================================
//     // Gerenciamento de Usuários
//     // ==================================================

//     const userSearchForm = document.getElementById("user-search-form");
//     const userTableBody = document.getElementById("user-table-body");

//     // Função para carregar todos os usuários
//     async function loadUsers() {
//         try {
//             const users = await sendAuthenticatedRequest("http://localhost:3000/users", "GET");
//             renderUsers(users);
//         } catch (error) {
//             console.error("Erro ao carregar usuários:", error);
//             alert("Erro ao carregar usuários. Verifique o console para mais detalhes.");
//         }
//     }

//     // Função para renderizar usuários na tabela
//     function renderUsers(users) {
//         userTableBody.innerHTML = ""; // Limpa a tabela

//         users.forEach(user => {
//             const row = document.createElement("tr");
//             row.innerHTML = `
//                 <td>${user.id}</td>
//                 <td>${user.name}</td>
//                 <td>${user.email}</td>
//                 <td>${user.user_type}</td>
//                 <td>
//                     <button class="btn btn-danger btn-sm delete-user" data-id="${user.id}">Excluir</button>
//                 </td>
//             `;
//             userTableBody.appendChild(row);
//         });

//         // Adiciona eventos aos botões de exclusão de usuários
//         document.querySelectorAll(".delete-user").forEach(button => {
//             button.addEventListener("click", () => deleteUser(button.dataset.id));
//         });
//     }

//     // Função para excluir usuário
//     async function deleteUser(userId) {
//         const confirmDelete = confirm("Tem certeza que deseja excluir este usuário?");

//         if (confirmDelete) {
//             try {
//                 await sendAuthenticatedRequest(`http://localhost:3000/users/${userId}`, "DELETE");
//                 alert("Usuário excluído com sucesso!");
//                 loadUsers(); // Recarrega a lista de usuários
//             } catch (error) {
//                 console.error("Erro ao excluir usuário:", error);
//                 alert("Erro ao excluir usuário. Verifique o console para mais detalhes.");
//             }
//         }
//     }

//     // Evento de envio do formulário de busca de usuários
//     userSearchForm.addEventListener("submit", async (e) => {
//         e.preventDefault();

//         const searchTerm = document.getElementById("user-search").value;

//         if (!searchTerm) {
//             alert("Digite um termo de busca (ID, nome ou e-mail).");
//             return;
//         }

//         try {
//             // Envia o termo de busca como parâmetro de consulta
//             const users = await sendAuthenticatedRequest(
//                 `http://localhost:3000/users/search?name=${encodeURIComponent(searchTerm)}`,
//                 "GET"
//             );
//             renderUsers(users);
//         } catch (error) {
//             console.error("Erro ao buscar usuários:", error);
//             alert("Erro ao buscar usuários. Verifique o console para mais detalhes.");
//         }
//     });

//     // ==================================================
//     // Inicialização
//     // ==================================================

//     // Carrega os conteúdos e usuários ao carregar a página
//     loadContents();
//     loadUsers();

//     // Logout
//     const logoutButton = document.getElementById("logout");
//     logoutButton.addEventListener("click", () => {
//         localStorage.clear(); // Limpa o localStorage
//         window.location.href = "./login.html"; // Redireciona para a página de login
//     });

//     // Redirecionamento para a homepage
//     const homepageLink = document.getElementById("homepage");
//     homepageLink.addEventListener("click", () => {
//         window.location.href = "./homepage_user.html";
//     });
// });
