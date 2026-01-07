function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!username || !password || !role) {
        alert("Please fill all fields");
        return;
    }

    fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password,
            role
        })
    })
    .then(res => res.json())
    .then(data => {

        if (!data.success) {
            alert("Login failed");
            return;
        }

        // ✅ SAVE TOKEN
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        // ✅ FORCE LIVE SERVER REDIRECT (IMPORTANT)
        if (data.role === "student") {
            window.location.href = "http://127.0.0.1:5500/student.html";
        } 
        else if (data.role === "parent") {
            window.location.href = "http://127.0.0.1:5500/parent.html";
        } 
        else if (data.role === "faculty") {
            window.location.href = "http://127.0.0.1:5500/faculty.html";
        } 
        else if (data.role === "admin") {
            window.location.href = "http://127.0.0.1:5500/admin.html";
        }
    })
    .catch(err => {
        console.error(err);
        alert("Server error");
    });
}
