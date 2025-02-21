// ==================================================
// Eventos
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
    // Carrega todos os conteúdos ao entrar na página
    fetchAllCatalog();

    // Eventos para os botões de filtro
    const btnFilmes = document.getElementById("btn-filmes");
    const btnSeries = document.getElementById("btn-series");
    const btnTodos = document.getElementById("btn-todos");

    if (btnFilmes) btnFilmes.addEventListener("click", () => fetchFilteredCatalog("filme"));
    if (btnSeries) btnSeries.addEventListener("click", () => fetchFilteredCatalog("serie"));
    if (btnTodos) btnTodos.addEventListener("click", () => fetchAllCatalog());

    // Evento para a barra de pesquisa
    const searchForm = document.getElementById("search-form");
    if (searchForm) {
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const searchTerm = document.getElementById("search-input").value.trim();

            if (!searchTerm) {
                console.warn("Pesquisa vazia. Digite algo para pesquisar.");
                return;
            }

            fetchByTitle(searchTerm);
        });
    }

    // Redirecionamento para páginas
    const homepage = document.getElementById("homepage");
    const about = document.getElementById("about");
    const settings = document.getElementById("settings");
    const logoutBtn = document.getElementById("logout");

    if (homepage) homepage.addEventListener("click", () => window.location.href = "homepage_user.html");
    if (about) about.addEventListener("click", () => window.location.href = "about.html");
    if (settings) settings.addEventListener("click", () => window.location.href = "config.html");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);

    // Evento para abrir o histórico no dropdown
    const verHistorico = document.getElementById("verHistorico");
    if (verHistorico) {
        verHistorico.addEventListener("click", (event) => {
            event.preventDefault(); // Impede o link de recarregar a página
            fetchHistory();
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Usuário não autenticado. Faça login novamente.");
        window.location.href = "./login.html";
        return;
    }

    // Função para decodificar o token JWT
    function decodeToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        } catch (error) {
            console.error("Erro ao decodificar o token:", error);
            return null;
        }
    }

    // Verifica se o usuário é administrador
    const payload = decodeToken(token);
    if (payload && payload.user_type === "Administrator") {
        // Mostra a opção de administração no dropdown
        const adminOption = document.getElementById("admin-option");
        if (adminOption) {
            adminOption.style.display = "block";
        }
    }

    // Outros eventos e funcionalidades da página...
});

// ==================================================
// Funções
// ==================================================

// Função para buscar todos os conteúdos (padrão)
async function fetchAllCatalog() {
    fetchCatalog("http://localhost:3000/catalog");
}

// Função para buscar apenas filmes ou séries
async function fetchFilteredCatalog(contentType) {
    fetchCatalog(`http://localhost:3000/catalog/type/${contentType}`);
}

// Função para buscar por título
async function fetchByTitle(title) {
    fetchCatalog(`http://localhost:3000/catalog/${title}`);
}

// Função genérica para buscar dados da API
async function fetchCatalog(url) {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Token não encontrado. Faça login.");
        return;
    }

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erro ao buscar dados: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json();
        generateCards(data);
    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
    }
}

// Função para buscar histórico
async function fetchHistory() {
    const token = localStorage.getItem("token");
    const historicoDropdown = document.getElementById("historicoDropdown");

    if (!token) {
        console.error("Token não encontrado. Faça login.");
        return;
    }

    try {
        // Decodifica o token JWT para extrair o userId
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId;

        if (!userId) {
            throw new Error("userId não encontrado no token.");
        }

        // Envia o userId como parte da URL
        const response = await fetch(`http://localhost:3000/history/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erro ao buscar histórico: ${errorMessage}`);
        }

        const history = await response.json();
        console.log("Histórico recebido do backend:", history);

        historicoDropdown.innerHTML = ""; // Limpa o dropdown antes de preencher

        if (!history || history.length === 0) {
            historicoDropdown.innerHTML = "<li class='list-group-item text-center'>Nenhum histórico encontrado.</li>";
            return;
        }

        // Para cada item do histórico, busca os dados do catálogo
        for (const item of history) {
            console.log("Buscando catálogo para catalog_id:", item.catalog_id);
            const catalogData = await fetchCatalogById(item.catalog_id);

            if (!catalogData) {
                console.error(`Erro ao buscar catálogo para catalog_id ${item.catalog_id}`);
                continue; // Pula para o próximo item se houver erro
            }

            // Cria o item do histórico com os dados do catálogo
            const li = document.createElement("li");
            li.classList.add("list-group-item", "small");

            if (catalogData.title) {
                li.innerHTML = `<a href="filme.html?title=${encodeURIComponent(catalogData.title)}">${catalogData.title}</a>`;
            } else {
                li.innerHTML = `<span class='text-muted'>Título não disponível</span>`;
            }

            historicoDropdown.appendChild(li);
        }

        // Alterna a visibilidade do histórico
        historicoDropdown.style.display = historicoDropdown.style.display === "none" ? "block" : "none";
    } catch (error) {
        console.error("Erro ao carregar o histórico:", error);
    }
}

// Função para buscar conteúdo por ID
async function fetchCatalogById(id) {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Token não encontrado. Faça login.");
        return null;
    }

    try {
        const response = await fetch(`http://localhost:3000/catalog/id/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erro ao buscar catálogo: ${errorMessage}`);
        }

        const catalogData = await response.json();
        console.log("Dados do catálogo recebidos:", catalogData);

        // Retorna o primeiro item do array (se existir)
        return catalogData.length > 0 ? catalogData[0] : null;
    } catch (error) {
        console.error("Erro ao buscar catálogo:", error);
        return null;
    }
}

// Função de Logout
async function logout() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("Nenhum token encontrado. O usuário já está desconectado.");
        window.location.href = "../index.html"; // Redireciona mesmo assim
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao fazer logout: ${response.statusText}`);
        }

        // Remove o token após o logout
        localStorage.removeItem("token");
    } catch (error) {
        console.error("Erro no logout:", error);
    } finally {
        // Redireciona para a página de login
        window.location.href = "../index.html";
    }
}

// Função para criar os cards dinamicamente
function generateCards(data) {
    const cardsContainer = document.querySelector(".cards");

    if (!cardsContainer) {
        console.error("Elemento .cards não encontrado no DOM.");
        return;
    }

    cardsContainer.innerHTML = ""; // Limpa antes de adicionar novos

    if (!data || data.length === 0) {
        cardsContainer.innerHTML = "<p class='text-center'>Nenhum resultado encontrado.</p>";
        return;
    }

    data.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("col-md-4", "mb-4");

        card.innerHTML = `
            <div class="card" style="width: 18rem;">
                <img src="${item.image_url}" class="card-img-top" alt="${item.title}">
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <p class="card-text">${item.description}</p>
                    <span class="badge bg-secondary">${item.genre}</span>
                    <span class="badge bg-info">${item.content_type}</span>
                    <br><br>
                    <a href="filme.html?title=${encodeURIComponent(item.title)}" class="btn btn-primary assistir-btn">Assistir</a>
                </div>
            </div>
        `;

        // Adiciona o evento de clique ao botão "Assistir"
        const assistirBtn = card.querySelector(".assistir-btn");
        assistirBtn.addEventListener("click", async (event) => {
            event.preventDefault(); // Impede o redirecionamento padrão

            try {
                // Registra o consumo do filme
                await registerConsumption(item.id);

                // Extrai o nome da API a partir do video_url
                const source = extractSourceFromUrl(item.video_url);

                if (!source) {
                    throw new Error("Não foi possível identificar a API a partir do video_url.");
                }

                // Registra o uso da API externa
                await registerApiUsage(source, item.id);

                // Redireciona para a página do filme após o consumo ser registrado
                window.location.href = `filme.html?title=${encodeURIComponent(item.title)}`;
            } catch (error) {
                console.error("Erro ao registrar consumo ou uso da API:", error);
                alert("Erro ao registrar o consumo. Tente novamente."); // Feedback para o usuário
            }
        });

        cardsContainer.appendChild(card);
    });
}

// Função para extrair o nome da API a partir do video_url
function extractSourceFromUrl(videoUrl) {
    try {
        const url = new URL(videoUrl); // Cria um objeto URL a partir da string
        const hostname = url.hostname; // Extrai o hostname (ex: "superflixapi.com")
        const source = hostname.split('.')[0]; // Extrai o nome da API (ex: "superflixapi")
        return source;
    } catch (error) {
        console.error("Erro ao extrair o nome da API:", error);
        return null;
    }
}

// Função para registrar o uso da API externa
async function registerApiUsage(source, catalogId) {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Token não encontrado. Faça login.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/external-api/register", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                source: source, // Nome da API
                catalogId: catalogId // ID do catálogo
            })
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erro ao registrar uso da API: ${errorMessage}`);
        }

        console.log("Uso da API registrado com sucesso!");
    } catch (error) {
        console.error("Erro ao registrar uso da API:", error);
        throw error; // Propaga o erro para ser tratado no evento de clique
    }
}

// Função para registrar o consumo (requisição POST)
async function registerConsumption(catalogId) {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Token não encontrado. Faça login.");
        return;
    }

    try {
        // Decodifica o token JWT para extrair o userId
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica o payload do token
        const userId = payload.userId; // Extrai o userId do token

        if (!userId) {
            throw new Error("userId não encontrado no token.");
        }

        const response = await fetch("http://localhost:3000/consumption/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                catalogId: catalogId, // ID do catálogo
                userId: userId // ID do usuário
            })
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erro ao registrar consumo: ${errorMessage}`);
        }

        console.log("Consumo registrado com sucesso!");
    } catch (error) {
        console.error("Erro ao registrar consumo:", error);
        throw error; // Propaga o erro para ser tratado no evento de clique
    }
}
