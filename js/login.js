const API_LOGIN_URL = "http://localhost:3000/auth/login";

document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(API_LOGIN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            window.location.href = "../index.html"; // Redireciona após login
        } else {
            alert(data.error || "Erro ao fazer login");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
});
