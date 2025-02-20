const titleFilme = new URLSearchParams(window.location.search).get("title");
console.log(`Título do filme: ${titleFilme}`);

const dadosFilme = document.getElementById("dadosFilme");

if (!titleFilme) {
    dadosFilme.innerHTML = `<p class="text-danger">Nenhum filme selecionado.</p>`;
} else {
    const token = localStorage.getItem("token"); // Obtém o token do localStorage

    fetch(`http://localhost:3000/catalog/${encodeURIComponent(titleFilme)}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`, // Adiciona o token JWT
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Filme não encontrado ou token inválido.");
        }
        return response.json();
    })
    .then(filme => {
        if (!filme.length) {
            throw new Error("Filme não encontrado no banco de dados.");
        }

        dadosFilme.innerHTML = `
            <iframe src="${filme[0].video_url}" width="100%" height="500px" frameborder="0" allowfullscreen></iframe>

            <section class="containerInfosFilme"> 
                <h1>${filme[0].title}</h1>
                <p>${filme[0].description}</p>
                <p><strong>Gênero:</strong> ${filme[0].genre}</p>
                <p><strong>Tipo:</strong> ${filme[0].content_type}</p>
            </section>
        `;
    })
    .catch(error => {
        console.error("Erro ao carregar o filme:", error);
        dadosFilme.innerHTML = `<p class="text-danger">Erro ao carregar o filme. Verifique se você está autenticado.</p>`;
    });
}
