function register() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const child = document.getElementById("child").value; // 👈 IMPORTANT
    if (!username || !password || !role) {
        alert("Please fill all required fields");
        return;
    }
    // If role is parent, child username is required
    if (role === "parent" && !child) {
        alert("Please enter child username for parent");
        return;
    }
    fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password,
            role,
            child   // 👈 THIS was missing before
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || "Registered successfully");
        window.location.href = "login.html";
    })
    .catch(err => {
        console.error(err);
        alert("Registration failed");
    });
}