// auth.js
export function getUserIdFromToken() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Token não encontrado. Faça login.");
        return null;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
    } catch (error) {
        console.error("Erro ao decodificar o token:", error);
        return null;
    }
}

export async function logout() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("Nenhum token encontrado. O usuário já está desconectado.");
        window.location.href = "../index.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao fazer logout: ${response.statusText}`);
        }

        localStorage.removeItem("token");
    } catch (error) {
        console.error("Erro no logout:", error);
    } finally {
        window.location.href = "../index.html";
    }
}