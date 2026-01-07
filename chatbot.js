function toggleChat() {
    const chat = document.getElementById("chatbot");
    chat.style.display = chat.style.display === "flex" ? "none" : "flex";
}
async function sendMessage() {
    const input = document.getElementById("chatInput");
    const chatBody = document.getElementById("chatBody");

    const msg = input.value.trim();
    if (!msg) return;

    chatBody.innerHTML += `<div class="user">${msg}</div>`;
    input.value = "";

    const thinking = document.createElement("div");
    thinking.className = "bot";
    thinking.innerText = "🤖 Thinking...";
    chatBody.appendChild(thinking);

    try {
        const res = await fetch("http://localhost:3000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: msg })
        });

        const data = await res.json();
        thinking.innerText = "🤖 " + data.reply;
    } catch {
        thinking.innerText = "⚠️ AI is unavailable right now.";
    }
}
