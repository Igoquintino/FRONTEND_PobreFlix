export async function fetchPoster(title) {
    try {
        const response = await fetch(`http://localhost:3000/api/external-api/movie-poster?title=${encodeURIComponent(title)}`);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.poster_url) {
            throw new Error("URL do poster não encontrada na resposta.");
        }
        return data.poster_url;
    } catch (error) {
        console.error("Erro ao buscar poster:", error);
        return null;
    }
}
