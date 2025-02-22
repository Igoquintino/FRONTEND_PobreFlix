// main.js
import { fetchCatalog } from './api.js';
import { logout } from './auth.js';
import { fetchHistory } from './history.js';
import { generateCards } from './catalog.js';

document.addEventListener("DOMContentLoaded", () => {
    fetchAllCatalog();

    const btnFilmes = document.getElementById("btn-filmes");
    const btnSeries = document.getElementById("btn-series");
    const btnTodos = document.getElementById("btn-todos");

    if (btnFilmes) btnFilmes.addEventListener("click", () => fetchFilteredCatalog("filme"));
    if (btnSeries) btnSeries.addEventListener("click", () => fetchFilteredCatalog("serie"));
    if (btnTodos) btnTodos.addEventListener("click", () => fetchAllCatalog());

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

    const homepage = document.getElementById("homepage");
    const about = document.getElementById("about");
    const settings = document.getElementById("settings");
    const logoutBtn = document.getElementById("logout");

    if (homepage) homepage.addEventListener("click", () => window.location.href = "homepage_user.html");
    if (about) about.addEventListener("click", () => window.location.href = "about.html");
    if (settings) settings.addEventListener("click", () => window.location.href = "config.html");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);

    const verHistorico = document.getElementById("verHistorico");
    if (verHistorico) {
        verHistorico.addEventListener("click", (event) => {
            event.preventDefault();
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
            //console.log(payload);
            return payload;
        } catch (error) {
            console.error("Erro ao decodificar o token:", error);
            return null;
        }
    }

    // Verifica se o usuário é administrador
    const payload = decodeToken(token);
    //console.log(payload.userType);
    if (payload && payload.userType === "Administrator") {
        // Mostra a opção de administração no dropdown
        const adminOption = document.getElementById("admin-option");
        if (adminOption) {
            adminOption.style.display = "block";
        }
    }
});

async function fetchAllCatalog() {
    const data = await fetchCatalog("http://localhost:3000/catalog");
    generateCards(data);
}

async function fetchFilteredCatalog(contentType) {
    const data = await fetchCatalog(`http://localhost:3000/catalog/type/${contentType}`);
    generateCards(data);
}

async function fetchByTitle(title) {
    const data = await fetchCatalog(`http://localhost:3000/catalog/${title}`);
    generateCards(data);
}