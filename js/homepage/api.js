// api.js
export async function fetchCatalog(url) {
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
        return data;
    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
        throw error;
    }
}

export async function fetchCatalogById(id) {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Token não encontrado. Faça login.");
        return null;
    }

    try {
        const response = await fetch(`http://localhost:3000/catalog/id/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erro ao buscar catálogo: ${errorMessage}`);
        }

        const catalogData = await response.json();
        return catalogData.length > 0 ? catalogData[0] : null;
    } catch (error) {
        console.error("Erro ao buscar catálogo:", error);
        throw error;
    }
}

export async function registerConsumption(catalogId, userId) {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Token não encontrado. Faça login.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/consumption/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                catalogId: catalogId,
                userId: userId
            })
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erro ao registrar consumo: ${errorMessage}`);
        }

        console.log("Consumo registrado com sucesso!");
    } catch (error) {
        console.error("Erro ao registrar consumo:", error);
        throw error;
    }
}

export async function registerApiUsage(source, catalogId) {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Token não encontrado. Faça login.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/external-api/register", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                source: source,
                catalogId: catalogId
            })
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Erro ao registrar uso da API: ${errorMessage}`);
        }

        console.log("Uso da API registrado com sucesso!");
    } catch (error) {
        console.error("Erro ao registrar uso da API:", error);
        throw error;
    }
}