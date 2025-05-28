document.addEventListener("DOMContentLoaded", function () {
    const titleFilme = new URLSearchParams(window.location.search).get("title");
    console.log(`Título do filme: ${titleFilme}`);

    const dadosFilme = document.getElementById("dadosFilme");

    if (!titleFilme) {
        dadosFilme.innerHTML = `<p class="text-danger">Nenhum filme selecionado.</p>`;
        return;
    }

    const token = localStorage.getItem("token"); // Obtém o token do localStorage
    const apikey = localStorage.getItem("pobreflix_api_key");


    if (!token) {
        dadosFilme.innerHTML = `<p class="text-danger">Usuário não autenticado. <a href="./login.html">Faça login</a> para acessar este conteúdo.</p>`;
        return;
    }

    fetch(`http://localhost:3000/catalog/${encodeURIComponent(titleFilme)}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`, // Adiciona o token JWT
            "x-api-key": apikey,
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

        // Renderiza o filme
        dadosFilme.innerHTML = `
            <div class="video-container mb-4">
                <iframe src="${filme[0].video_url}" width="100%" height="500px" frameborder="0" allowfullscreen></iframe>
            </div>
            <section class="containerInfosFilme">
                <h1 class="mb-3">${filme[0].title}</h1>
                <p class="mb-3">${filme[0].description}</p>
                <p class="mb-2"><strong>Gênero:</strong> ${filme[0].genre}</p>
                <p class="mb-2"><strong>Tipo:</strong> ${filme[0].content_type}</p>
            </section>
        `;
    })
    .catch(error => {
        console.error("Erro ao carregar o filme:", error);
        dadosFilme.innerHTML = `
            <p class="text-danger">Erro ao carregar o filme. Verifique se você está autenticado ou tente novamente mais tarde.</p>
            <a href="./homepage_user.html" class="btn btn-danger">Voltar para a página inicial</a>
        `;
    });

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

    // Logout
    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", (e) => {
            e.preventDefault(); // Evita o comportamento padrão do link
            localStorage.clear(); // Limpa o localStorage
            window.location.href = "./login.html"; // Redireciona para a página de login
        });
    }
});