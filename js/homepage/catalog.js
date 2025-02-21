// catalog.js
import { fetchCatalog, fetchCatalogById, registerConsumption, registerApiUsage } from './api.js';
import { getUserIdFromToken } from './auth.js';

export function generateCards(data) {
    const cardsContainer = document.querySelector(".cards");

    if (!cardsContainer) {
        console.error("Elemento .cards não encontrado no DOM.");
        return;
    }

    cardsContainer.innerHTML = "";

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

        const assistirBtn = card.querySelector(".assistir-btn");
        assistirBtn.addEventListener("click", async (event) => {
            event.preventDefault();

            try {
                const userId = getUserIdFromToken();
                if (!userId) {
                    throw new Error("Usuário não autenticado.");
                }

                await registerConsumption(item.id, userId);

                const source = extractSourceFromUrl(item.video_url);
                if (!source) {
                    throw new Error("Não foi possível identificar a API a partir do video_url.");
                }

                await registerApiUsage(source, item.id);

                window.location.href = `filme.html?title=${encodeURIComponent(item.title)}`;
            } catch (error) {
                console.error("Erro ao registrar consumo ou uso da API:", error);
                alert("Erro ao registrar o consumo. Tente novamente.");
            }
        });

        cardsContainer.appendChild(card);
    });
}

export function extractSourceFromUrl(videoUrl) {
    try {
        const url = new URL(videoUrl);
        const hostname = url.hostname;
        const source = hostname.split('.')[0];
        return source;
    } catch (error) {
        console.error("Erro ao extrair o nome da API:", error);
        return null;
    }
}