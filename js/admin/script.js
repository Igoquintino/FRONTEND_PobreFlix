document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("userId"); // Recupera o userId do localStorage
    const token = localStorage.getItem("token"); // Recupera o token do localStorage

    if (!userId || !token) {
        alert("Usuário não autenticado. Faça login novamente.");
        window.location.href = "./login.html"; // Redireciona para a página de login
        return;
    }

    // Função para enviar requisições autenticadas
    async function sendAuthenticatedRequest(url, method, body = null) {
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Inclui o token no cabeçalho
        };

        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body ? JSON.stringify(body) : null, // Envia o corpo da requisição, se houver
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erro na requisição.");
        }

        return response.json();
    }

    // ==================================================
    // Gerenciamento de Conteúdos
    // ==================================================

    // Formulário para adicionar/editar conteúdo
    const contentForm = document.getElementById("content-form");
    const contentTableBody = document.getElementById("content-table-body");

    // Função para carregar todos os conteúdos
    async function loadContents() {
        try {
            const contents = await sendAuthenticatedRequest("http://localhost:3000/catalog", "GET");
            renderContents(contents);
        } catch (error) {
            console.error("Erro ao carregar conteúdos:", error);
            alert(error.message);
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
            const content = await sendAuthenticatedRequest(`http://localhost:3000/catalog/${contentId}`, "GET");

            // Preenche o formulário com os dados do conteúdo
            document.getElementById("content-title").value = content.title;
            document.getElementById("content-description").value = content.description;
            document.getElementById("content-genre").value = content.genre;
            document.getElementById("content-type").value = content.content_type;
            document.getElementById("content-image-url").value = content.image_url;
            document.getElementById("content-video-url").value = content.video_url;

            // Altera o botão do formulário para "Atualizar"
            contentForm.querySelector("button").textContent = "Atualizar Conteúdo";
            contentForm.dataset.contentId = contentId; // Armazena o ID do conteúdo no formulário
        } catch (error) {
            console.error("Erro ao carregar conteúdo:", error);
            alert(error.message);
        }
    }

    // Função para excluir conteúdo
    async function deleteContent(contentId) {
        const confirmDelete = confirm("Tem certeza que deseja excluir este conteúdo?");

        if (confirmDelete) {
            try {
                await sendAuthenticatedRequest(`http://localhost:3000/catalog/${contentId}`, "DELETE");
                alert("Conteúdo excluído com sucesso!");
                loadContents(); // Recarrega a lista de conteúdos
            } catch (error) {
                console.error("Erro ao excluir conteúdo:", error);
                alert(error.message);
            }
        }
    }

    // Evento de envio do formulário de conteúdo
    contentForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const contentId = contentForm.dataset.contentId; // Verifica se é uma edição
        const method = contentId ? "PATCH" : "POST"; // Define o método HTTP
        const url = contentId ? `http://localhost:3000/catalog/${contentId}` : "http://localhost:3000/catalog/addCatalog";

        const contentData = {
            title: document.getElementById("content-title").value,
            description: document.getElementById("content-description").value,
            genre: document.getElementById("content-genre").value,
            content_type: document.getElementById("content-type").value,
            image_url: document.getElementById("content-image-url").value,
            video_url: document.getElementById("content-video-url").value,
        };

        try {
            await sendAuthenticatedRequest(url, method, contentData);
            alert(contentId ? "Conteúdo atualizado com sucesso!" : "Conteúdo adicionado com sucesso!");
            contentForm.reset(); // Limpa o formulário
            delete contentForm.dataset.contentId; // Remove o ID do conteúdo
            loadContents(); // Recarrega a lista de conteúdos
        } catch (error) {
            console.error("Erro ao salvar conteúdo:", error);
            alert(error.message);
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
            const users = await sendAuthenticatedRequest("http://localhost:3000/users", "GET");
            renderUsers(users);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            alert(error.message);
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
            `;
            userTableBody.appendChild(row);
        });
    }

    // Evento de envio do formulário de busca de usuários
    userSearchForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const searchTerm = document.getElementById("user-search").value;

        try {
            const users = await sendAuthenticatedRequest(`http://localhost:3000/users/search?query=${searchTerm}`, "GET");
            renderUsers(users);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            alert(error.message);
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
    logoutButton.addEventListener("click", () => {
        localStorage.clear(); // Limpa o localStorage
        window.location.href = "./login.html"; // Redireciona para a página de login
    });

    // Redirecionamento para a homepage
    const homepageLink = document.getElementById("homepage");
    homepageLink.addEventListener("click", () => {
        window.location.href = "./homepage_user.html";
    });
});
