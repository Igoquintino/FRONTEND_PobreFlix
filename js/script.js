const API_URL = "http://localhost:3000/catalog"; // Ajuste conforme a hospedagem do backend

document.addEventListener("DOMContentLoaded", async () => {
    const catalogContainer = document.getElementById("catalog");

    try {
        const response = await fetch(API_URL, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) {
            throw new Error("Erro ao buscar filmes");
        }

        const filmes = await response.json();
        catalogContainer.innerHTML = filmes.map(filme => `
            <div class="col-md-4">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">${filme.title}</h5>
                        <p class="card-text">${filme.description}</p>
                        <a href="#" class="btn btn-primary" onclick="assistir('${filme.id}')">Assistir</a>
                    </div>
                </div>
            </div>
        `).join("");
    } catch (error) {
        console.error("Erro:", error);
        catalogContainer.innerHTML = `<p class="text-danger">Não foi possível carregar os filmes.</p>`;
    }
});

function assistir(filmeId) {
    alert(`Iniciando reprodução do filme ID: ${filmeId}`);
    // Aqui você pode adicionar lógica para abrir o player de vídeo
}




document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "pages/login.html"; // Redireciona para login
});
