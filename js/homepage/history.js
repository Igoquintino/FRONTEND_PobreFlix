// // history.js
// import { fetchCatalogById } from './api.js';

// export async function fetchHistory() {
//     const token = localStorage.getItem("token");
//     const historicoDropdown = document.getElementById("historicoDropdown");

//     if (!token) {
//         console.error("Token não encontrado. Faça login.");
//         return;
//     }

//     try {
//         const userId = getUserIdFromToken();

//         if (!userId) {
//             throw new Error("userId não encontrado no token.");
//         }

//         const response = await fetch(`http://localhost:3000/history/${userId}`, {
//             method: "GET",
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "application/json"
//             }
//         });

//         if (!response.ok) {
//             const errorMessage = await response.text();
//             throw new Error(`Erro ao buscar histórico: ${errorMessage}`);
//         }

//         const history = await response.json();
//         console.log("Histórico recebido do backend:", history);

//         historicoDropdown.innerHTML = "";

//         if (!history || history.length === 0) {
//             historicoDropdown.innerHTML = "<li class='list-group-item text-center'>Nenhum histórico encontrado.</li>";
//             return;
//         }

//         for (const item of history) {
//             console.log("Buscando catálogo para catalog_id:", item.catalog_id);
//             const catalogData = await fetchCatalogById(item.catalog_id);

//             if (!catalogData) {
//                 console.error(`Erro ao buscar catálogo para catalog_id ${item.catalog_id}`);
//                 continue;
//             }

//             const li = document.createElement("li");
//             li.classList.add("list-group-item", "small");

//             if (catalogData.title) {
//                 li.innerHTML = `<a href="filme.html?title=${encodeURIComponent(catalogData.title)}">${catalogData.title}</a>`;
//             } else {
//                 li.innerHTML = `<span class='text-muted'>Título não disponível</span>`;
//             }

//             historicoDropdown.appendChild(li);
//         }

//         historicoDropdown.style.display = historicoDropdown.style.display === "none" ? "block" : "none";
//     } catch (error) {
//         console.error("Erro ao carregar o histórico:", error);
//     }
// }

// history.js
import { fetchCatalogById } from './api.js';
import { getUserIdFromToken } from './auth.js'; // Importação adicionada

export async function fetchHistory() {
    const token = localStorage.getItem("token");
    const historicoDropdown = document.getElementById("historicoDropdown");

    if (!token) {
        console.error("Token não encontrado. Faça login.");
        return;
    }

    try {
        const userId = getUserIdFromToken(); // Agora a função está disponível

        if (!userId) {
            throw new Error("userId não encontrado no token.");
        }

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

        historicoDropdown.innerHTML = "";

        if (!history || history.length === 0) {
            historicoDropdown.innerHTML = "<li class='list-group-item text-center'>Nenhum histórico encontrado.</li>";
            return;
        }

        for (const item of history) {
            console.log("Buscando catálogo para catalog_id:", item.catalog_id);
            const catalogData = await fetchCatalogById(item.catalog_id);

            if (!catalogData) {
                console.error(`Erro ao buscar catálogo para catalog_id ${item.catalog_id}`);
                continue;
            }

            const li = document.createElement("li");
            li.classList.add("list-group-item", "small");

            if (catalogData.title) {
                li.innerHTML = `<a href="filme.html?title=${encodeURIComponent(catalogData.title)}">${catalogData.title}</a>`;
            } else {
                li.innerHTML = `<span class='text-muted'>Título não disponível</span>`;
            }

            historicoDropdown.appendChild(li);
        }

        historicoDropdown.style.display = historicoDropdown.style.display === "none" ? "block" : "none";
    } catch (error) {
        console.error("Erro ao carregar o histórico:", error);
    }
}
