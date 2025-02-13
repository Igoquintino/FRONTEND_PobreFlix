// // Simulação de dados vindo do backend (substituir por fetch real)
// const catalogData = [
//     {
//         title: "Filme 1",
//         description: "Descrição do Filme 1",
//         genre: "Ação",
//         content_type: "filme",
//         video_url: "https://exemplo.com/video1",
//         image_url: "https://via.placeholder.com/150"
//     },
//     {
//         title: "Série 1",
//         description: "Descrição da Série 1",
//         genre: "Drama",
//         content_type: "serie",
//         video_url: "https://exemplo.com/video2",
//         image_url: "https://via.placeholder.com/150"
//     }
// ];


// Função para buscar os dados da API com autenticação JWT
async function fetchCatalog() {
    const token = localStorage.getItem("token"); // Recupera o token do localStorage

    if (!token) {
        console.error("Token não encontrado. Faça login.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/catalog", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao buscar dados: ${response.statusText}`);
        }

        const data = await response.json(); // Converte a resposta para JSON
        generateCards(data); // Chama a função para criar os cards

    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
    }
}






// Função para criar os cards dinamicamente
function generateCards(data) {
    // const cardsContainer = document.querySelector('.cards'); // Seleciona o container dos cards
    // cardsContainer.innerHTML = ""; // Limpa antes de adicionar novos

    // data.forEach(item => {
    //     const card = document.createElement("div");
    //     card.classList.add("card");
    //     card.style.width = "18rem";

    //     card.innerHTML = `
    //         <img src="${item.image_url}" class="card-img-top" alt="${item.title}">
    //         <div class="card-body">
    //             <h5 class="card-title">${item.title}</h5>
    //             <p class="card-text">${item.description}</p>
    //             <a href="${item.video_url}" class="btn btn-primary" target="_blank">Assistir</a>
    //         </div>
    //     `;
    //     cardsContainer.appendChild(card);
    // });

    const cardsContainer = document.querySelector('.cards'); // Seleciona o container dos cards
    cardsContainer.innerHTML = ""; // Limpa antes de adicionar novos

    data.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("col-md-4", "mb-4"); // Classes Bootstrap para responsividade

        card.innerHTML = `
            <div class="card" style="width: 18rem;">
                <img src="${item.image_url}" class="card-img-top" alt="${item.title}">
                <div class="card-body">
                    <h5 class="card-title">${item.title}</h5>
                    <p class="card-text">${item.description}</p>
                    <span class="badge bg-secondary">${item.genre}</span>
                    <span class="badge bg-info">${item.content_type}</span>
                    <br><br>
                    <a href="${item.video_url}" class="btn btn-primary" target="_blank">Assistir</a>
                </div>
            </div>
        `;

        cardsContainer.appendChild(card);
    });



}


// Chama a função ao carregar a página
document.addEventListener("DOMContentLoaded", fetchCatalog);



// Chama a função para popular os cards na página
// generateCards(catalogData);
