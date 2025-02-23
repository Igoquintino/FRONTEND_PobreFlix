export function checkAuth() {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
        alert("Usuário não autenticado. Faça login novamente.");
        window.location.href = "./login.html";
        return false;
    }

    return true;
}

export function logout() {
    localStorage.clear();
    window.location.href = "./login.html";
}
