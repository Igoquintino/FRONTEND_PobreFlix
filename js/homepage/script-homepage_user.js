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

        // Removendo o token após o logout
        localStorage.removeItem("token");

    } catch (error) {
        console.error("Erro no logout:", error);
    } finally {
        // Redireciona para a página de login independentemente do resultado da requisição
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
                    
                    <a href="filme.html?title=${encodeURIComponent(item.title)}" class="btn btn-primary">Assistir</a>
                </div>
            </div>
        `;

        cardsContainer.appendChild(card);
    });
}

// Adiciona eventos aos botões
document.addEventListener("DOMContentLoaded", () => {
    fetchAllCatalog(); // Carrega tudo ao entrar na página

    // Verifica se os botões existem antes de adicionar os eventos
    const btnFilmes = document.getElementById("btn-filmes");
    const btnSeries = document.getElementById("btn-series");
    const btnTodos = document.getElementById("btn-todos");
    const searchForm = document.getElementById("search-form");

    if (btnFilmes) btnFilmes.addEventListener("click", () => fetchFilteredCatalog("filme"));
    if (btnSeries) btnSeries.addEventListener("click", () => fetchFilteredCatalog("serie"));
    if (btnTodos) btnTodos.addEventListener("click", () => fetchAllCatalog());

    // Evento para a barra de pesquisa
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
    if (logoutBtn) logoutBtn.addEventListener("click",logout);
});
