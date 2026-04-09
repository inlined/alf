import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { GoogleAIBackend, VertexAIBackend, getAI, getGenerativeModel } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-ai.js";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

let app;

async function initializeFirebase() {
    try {
        // N.B. This makes the code portable but will break unless the app has
        // been created and associated with the site in the Firebase console.
        const response = await fetch('/__/firebase/init.json');
        const config = await response.json();
        
        console.log("Initializing app with config", config);
        app = await initializeApp(config);
        console.log("Done initializing");
    } catch (error) {
        console.error("Failed to initialize Firebase:", error);
    }
}

initializeFirebase();

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send');

const apiToggleButtons = document.querySelectorAll('#api-toggle .toggle-btn');
const scopeToggleButtons = document.querySelectorAll('#scope-toggle .toggle-btn');

let currentApi = 'gemini';
let currentScope = 'global';

// Toggle handlers
apiToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        apiToggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentApi = btn.dataset.value;
        appendSystemMessage(`Switched to API: ${currentApi}`);
    });
});

scopeToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        scopeToggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentScope = btn.dataset.value;
        appendSystemMessage(`Switched to Scope: ${currentScope}`);
    });
});

function appendMessage(text, type) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', type);
    msgDiv.innerHTML = marked.parse(text);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendSystemMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.style.alignSelf = 'center';
    msgDiv.style.fontSize = '0.75rem';
    msgDiv.style.color = '#64748b';
    msgDiv.style.background = 'rgba(255,255,255,0.02)';
    msgDiv.style.padding = '0.25rem 0.75rem';
    msgDiv.style.borderRadius = '10px';
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function handleSendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    if (!app) {
        appendSystemMessage("Firebase is still initializing. Please wait...");
        await initializeFirebase();
    }

    appendMessage(text, 'user');
    userInput.value = '';

    // Simulate or Call AI Logic
    appendMessage("Thinking...", 'agent');
    const thinkingMsg = chatBox.lastElementChild;

    try {
        // Here we would call the Firebase AI Logic SDK or a mock function
        // For demonstration and emulator testing, we might call a local function or mock
        // Since we want to test the WEBHOOKS (server side), the call must route through the service
        // that triggers the hooks.
        // For now, we simulate the delay and the response.
        // In a real impl, we would use the getAI() and generateContent() style.

        const location = currentScope === 'regional' ? 'us-central1' : 'global';
        const backend = currentApi === 'gemini' ? new GoogleAIBackend() : new VertexAIBackend(location);
        const ai = getAI(app, { backend }, { baseUrl: 'autopush-firebasevertexai.sandbox.googleapis.com' });
        const model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });

        const result = await model.generateContent(text);
        const response = await result.response;

        thinkingMsg.innerHTML = marked.parse(response.text());

    } catch (error) {
        thinkingMsg.textContent = `Error: ${error.message}`;
        // Show in console with stack dump
        throw error;
    }
}

sendBtn.addEventListener('click', handleSendMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});
