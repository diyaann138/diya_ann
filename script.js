var app = new function () {
    this.el = document.getElementById('tasks');
    this.tasks = [];
  
    this.FetchAll = function () {
      let data = '';
  
      if (this.tasks.length > 0) {
        for (let i = 0; i < this.tasks.length; i++) {
          data += `<tr>
                    <td>${escapeHTML(this.tasks[i].text)}</td>
                    <td>${this.tasks[i].priority}</td>
                    <td><button onclick="app.Edit(${i})">Edit</button></td>
                    <td><button onclick="app.Delete(${i})">Delete</button></td>
                   </tr>`;
        }
      }
  
      this.Count(this.tasks.length);
      this.el.innerHTML = data;
    };
  
    this.Add = function () {
      let el = document.getElementById('add-todo');
      let priority = document.getElementById('priority').value;
      let task = el.value.trim();
      if (task) {
        this.tasks.push({ text: task, priority: priority });
        el.value = '';
        this.FetchAll();
      }
    };
  
    this.Edit = function (item) {
      let el = document.getElementById('edit-todo');
      let priorityEl = document.getElementById('edit-priority');
  
      el.value = this.tasks[item].text;
      priorityEl.value = this.tasks[item].priority;
      document.getElementById('edit-box').style.display = 'block';
  
      document.getElementById('save-edit').onsubmit = () => {
        let updatedText = el.value.trim();
        let updatedPriority = priorityEl.value;
        if (updatedText) {
          this.tasks[item] = { text: updatedText, priority: updatedPriority };
          this.FetchAll();
          CloseInput();
        }
        return false;
      };
    };
  
    this.Delete = function (item) {
      this.tasks.splice(item, 1);
      this.FetchAll();
    };
  
    this.Count = function (data) {
      document.getElementById('counter').innerText = data ? `${data} Task${data > 1 ? 's' : ''}` : 'No Tasks';
    };
  };
  
  function CloseInput() {
    document.getElementById('edit-box').style.display = 'none';
  }
  
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
  }
  
  app.FetchAll();
  const API_KEY = "AIzaSyChT0BNpJ6K2ec5mu-oM78sGsYIqCAcaG8";
  let history = [{
    role: "user",
    parts: [
      "You are a smart assistant that helps users manage to-do lists. You can add, remove, and prioritize tasks. If asked unrelated questions, say: 'Let's stay focused on your tasks.'"
    ]
  }];
  
  async function sendMessage() {
    const input = document.getElementById("user-input");
    const userMessage = input.value.trim();
    if (!userMessage) return;
  
    appendMessage("user", userMessage);
    input.value = "";
    const commandReply = parseAndExecuteCommand(userMessage);
    if (commandReply) {
        appendMessage("bot", commandReply);
        return;
    }

    appendMessage("bot", "Typing...");
    history.push({ role: "user", parts: [userMessage] });
  
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: history })
        }
      );
      const data = await response.json();
      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't respond.";
      appendMessage("bot", botReply);
      history.push({ role: "model", parts: [botReply] });
    } catch (err) {
        appendMessage("bot", "Error connecting to assistant.");
    }

    function parseAndExecuteCommand(message) {
        const lower = message.toLowerCase();
      
        if (lower.startsWith("add task")) {
          const task = message.substring(9).trim();
          if (task) {
            app.tasks.push(task);
            app.FetchAll();
            return `Task "${task}" added.`;
          }
        }
      
        if (lower.startsWith("delete task")) {
          const num = parseInt(lower.replace(/[^\d]/g, ""));
          if (!isNaN(num) && num > 0 && num <= app.tasks.length) {
            const deleted = app.tasks.splice(num - 1, 1);
            app.FetchAll();
            return `Task "${deleted}" deleted.`;
          }
        }
      
        if (lower.startsWith("edit task")) {
          const match = message.match(/edit task (\d+) to (.+)/i);
          if (match) {
            const index = parseInt(match[1]) - 1;
            const newText = match[2].trim();
            if (app.tasks[index] !== undefined) {
              app.tasks[index] = newText;
              app.FetchAll();
              return `Task ${index + 1} updated to "${newText}".`;
            }
          }
        }
      
        if (lower.includes("show") && lower.includes("tasks")) {
          return app.tasks.length ? app.tasks.map((t, i) => `${i + 1}. ${t}`).join('\n') : "No tasks yet.";
        }
      
        return null;
      }
      
  }
  
  document.getElementById("open-chatbot").addEventListener("click", () => {
    document.getElementById("chatbot-panel").classList.add("open");
  });
  
  document.getElementById("close-chatbot").addEventListener("click", () => {
    document.getElementById("chatbot-panel").classList.remove("open");
  });
  
  function appendMessage(role, text) {
    const chat = document.getElementById("chat-messages");
    const message = document.createElement("div");
    message.className = role;
    message.textContent = `${role === "user" ? "You" : "Bot"}: ${text}`;
    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
  }
  function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }
  
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  
    recognition.onstart = function () {
      console.log("Voice recognition started. Speak your task...");
    };
  
    recognition.onerror = function (event) {
      console.error("Speech recognition error:", event.error);
    };
  
    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      document.getElementById('add-todo').value = transcript;
      console.log("Recognized:", transcript);
    };
  
    recognition.start();
  }
  
let username = "User"; // You can get this from auth

function appendMessage(role, text) {
  const chat = document.getElementById("chat-messages");
  const message = document.createElement("div");
  message.className = role;
  message.textContent = `${role === 'user' ? username : 'Bot'}: ${text}`;
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}
// Check for SpeechRecognition support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    document.getElementById("speak-btn").addEventListener("click", () => {
        recognition.start();
        appendMessage("bot", "Listening...");
    });

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById("user-input").value = transcript;
        appendMessage("user", transcript);
        sendMessage(); // Send transcript to chatbot
    };

    recognition.onerror = function (event) {
        appendMessage("bot", "⚠️ Voice input error: " + event.error);
    };
} else {
    document.getElementById("speak-btn").disabled = true;
    alert("Speech recognition not supported in this browser.");
}
