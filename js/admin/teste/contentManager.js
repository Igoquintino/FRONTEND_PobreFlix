import { sendAuthenticatedRequest } from './api.js';
import { fetchPoster } from '../modules/utils.js';

export function setupContentManager() {
    const contentForm = document.getElementById("content-form");
    const contentTableBody = document.getElementById("content-table-body");
    const posterPreview = document.getElementById("poster-preview");

    // Carrega os conteúdos ao iniciar
    loadContents();

    // Evento de envio do formulário de conteúdo
    contentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await handleContentFormSubmit(contentForm);
    });

    // Evento de busca de poster ao digitar o título
    document.getElementById("content-title").addEventListener("input", async (e) => {
        const title = e.target.value.trim();
        if (title) {
            const posterUrl = await fetchPoster(title);
            if (posterUrl) {
                document.getElementById("content-poster-url").value = posterUrl;
                posterPreview.src = posterUrl;
                posterPreview.style.display = "block";
            } else {
                posterPreview.style.display = "none";
            }
        }
    });

    // Função para carregar conteúdos
    async function loadContents() {
        try {
            const contents = await sendAuthenticatedRequest("http://localhost:3000/catalog", "GET");
            renderContents(contents);
        } catch (error) {
            console.error("Erro ao carregar conteúdos:", error);
            alert("Erro ao carregar conteúdos. Verifique o console para mais detalhes.");
        }
    }

    // Função para renderizar conteúdos na tabela
    function renderContents(contents) {
        contentTableBody.innerHTML = "";

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

            document.getElementById("content-title").value = content.title;
            document.getElementById("content-description").value = content.description;
            document.getElementById("content-genre").value = content.genre;
            document.getElementById("content-type").value = content.content_type;
            document.getElementById("content-video-url").value = content.video_url;

            contentForm.querySelector("button").textContent = "Atualizar Conteúdo";
            contentForm.dataset.contentId = contentId;

            const posterUrl = await fetchPoster(content.title);
            if (posterUrl) {
                document.getElementById("content-poster-url").value = posterUrl;
            }
        } catch (error) {
            console.error("Erro ao carregar conteúdo:", error);
            alert("Erro ao carregar conteúdo. Verifique o console para mais detalhes.");
        }
    }

    // Função para excluir conteúdo
    async function deleteContent(contentId) {
        const confirmDelete = confirm("Tem certeza que deseja excluir este conteúdo?");
        if (confirmDelete) {
            try {
                await sendAuthenticatedRequest(`http://localhost:3000/catalog/${contentId}`, "DELETE");
                alert("Conteúdo excluído com sucesso!");
                loadContents();
            } catch (error) {
                console.error("Erro ao excluir conteúdo:", error);
                alert("Erro ao excluir conteúdo. Verifique o console para mais detalhes.");
            }
        }
    }

    // Função para lidar com o envio do formulário de conteúdo
    async function handleContentFormSubmit(form) {
        const contentId = form.dataset.contentId;
        const method = contentId ? "PATCH" : "POST";
        const url = contentId ? `http://localhost:3000/catalog/${contentId}` : "http://localhost:3000/catalog/addCatalog";

        const contentData = {
            title: document.getElementById("content-title").value,
            description: document.getElementById("content-description").value,
            genre: document.getElementById("content-genre").value,
            content_type: document.getElementById("content-type").value,
            video_url: document.getElementById("content-video-url").value,
            poster_url: document.getElementById("content-poster-url").value,
        };

        try {
            await sendAuthenticatedRequest(url, method, contentData);
            alert(contentId ? "Conteúdo atualizado com sucesso!" : "Conteúdo adicionado com sucesso!");
            form.reset();
            delete form.dataset.contentId;
            loadContents();
        } catch (error) {
            console.error("Erro ao salvar conteúdo:", error);
            alert("Erro ao salvar conteúdo. Verifique o console para mais detalhes.");
        }
    }
}
