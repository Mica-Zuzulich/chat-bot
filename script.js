import CONFIG from "./config/config.js";

const sounds = {
    send: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3'),
    receive: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3')
};

let stats = {
    messagesSent: 0,
    charactersTyped: 0,
    startTime: new Date()
};

document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const themeToggle = document.getElementById('themeToggle');
    const languageSelect = document.getElementById('languageSelect');
    const helpBtn = document.getElementById('helpBtn');
    const clearBtn = document.getElementById('clearBtn');
    const timeBtn = document.getElementById('timeBtn');
    
    const languagePrompts = {
        es: 'Eres Mica, un asistente útil y amigable que habla español. Responde de forma conversacional y natural. Usa emojis frecuentemente. Tu personalidad es cercana pero profesional.',
        en: 'You are Mica, a helpful and friendly assistant that speaks English. Respond in a conversational and natural way. Use emojis frequently. Your personality is close but professional.',
        fr: 'Vous êtes Mica, un assistant utile et amical qui parle français. Répondez de manière conversationnelle et naturelle. Utilisez des émojis fréquemment. Votre personnalité est proche mais professionnelle.',
        it: 'Sei Mica, un assistente utile e amichevole che parla italiano. Rispondi in modo conversazionale e naturale. Usa le emoji frequentemente. La tua personalità è vicina ma professionale.',
        pt: 'Você é Mica, um assistente útil e amigável que fala português. Responda de forma conversacional e natural. Use emojis frequentemente. Sua personalidade é próxima, mas profissional.'
    };

    const greetings = {
        es: '👋 ¡Hola! Soy **Mica**, tu asistente. ¿En qué puedo ayudarte hoy?',
        en: '👋 Hello! I am **Mica**, your assistant. How can I help you today?',
        fr: '👋 Bonjour ! Je suis **Mica**, votre assistante. Comment puis-je vous aider aujourd\'hui ?',
        it: '👋 Ciao! Sono **Mica**, il tuo assistente. Come posso aiutarti oggi?',
        pt: '👋 Olá! Sou **Mica**, sua assistente. Como posso ajudá-lo hoje?'
    };

    const placeholders = {
        es: 'Escribe tu mensaje...',
        en: 'Type your message...',
        fr: 'Tapez votre message...',
        it: 'Scrivi il tuo messaggio...',
        pt: 'Digite sua mensagem...'
    };

    let currentLanguage = 'es';

    loadConversation();

    function changeLanguage() {
        currentLanguage = languageSelect.value;
        
        chatMessages.innerHTML = '';
        addMessage(greetings[currentLanguage], false);
        userInput.placeholder = placeholders[currentLanguage];
        saveConversation();
    }

    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        let textWithEmojis = text
            .replace(/:\)/g, '😊')
            .replace(/:\(/g, '😢')
            .replace(/:D/g, '😄')
            .replace(/;\)/g, '😉')
            .replace(/<3/g, '❤️')
            .replace(/:\|/g, '😐')
            .replace(/:\//g, '😕')
            .replace(/:\*/g, '😘')
            .replace(/8\)/g, '😎')
            .replace(/:\'\(/g, '😭')
            .replace(/:o/g, '😮')
            .replace(/:\?/g, '❓')
            .replace(/!:\)/g, '👻')
            .replace(/\bhola\b/gi, '👋 hola')
            .replace(/\badios\b/gi, '👋 adiós')
            .replace(/\bgracias\b/gi, '🙏 gracias')
            .replace(/\bperdon\b/gi, '😅 perdón')
            .replace(/\bgenial\b/gi, '🎉 genial')
            .replace(/\bincreible\b/gi, '🤯 increíble')
            .replace(/\bdivertido\b/gi, '😄 divertido')
            .replace(/\bben\b/gi, '👍 bien')
            .replace(/\bmal\b/gi, '👎 mal');
        
        messageDiv.textContent = textWithEmojis;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        if (stats.messagesSent > 0 && stats.messagesSent % 5 === 0) {
            messageDiv.classList.add('celebrate');
        }
        
        saveConversation();
    }

    function showTyping() {
        typingIndicator.style.display = 'block';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTyping() {
        typingIndicator.style.display = 'none';
    }
async function getBotResponse(userMessage) {
    try {
        const response = await fetch(`${CONFIG.BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                language: currentLanguage
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        sounds.receive.play().catch(e => console.log('Audio error:', e));
        return data.reply;

    } catch (error) {
        console.error('Error:', error);
        return currentLanguage === 'es'
            ? '😅 ¡Ups! Hubo un error. ¿Podés intentarlo de nuevo?'
            : '😅 Oops! There was an error. Can you try again?';
    }
}


    function handleClearChat() {
        chatMessages.innerHTML = '';
        addMessage('🗑️ Chat limpiado. ¡Hablemos de nuevo!', false);
        saveConversation();
    }

    function handleHelp() {
        addMessage('ℹ️ **¿Necesitás ayuda?**\n\n• Escribí tu mensaje normal para chatear\n• Usá los botones de abajo para:\n  🗑️ Limpiar el chat\n  🕒 Ver la hora\n  🔍 Esta ayuda', false);
    }

    function handleShowTime() {
        const now = new Date();
        addMessage(`🕒 Son las ${now.toLocaleTimeString()} del ${now.toLocaleDateString()}`, false);
    }

    function showStatistics() {
        const timeUsed = Math.round((new Date() - stats.startTime) / 1000 / 60);
        const statsText = `📊 **Estadísticas de nuestra conversación:**\n\n• Mensajes enviados: ${stats.messagesSent}\n• Caracteres escritos: ${stats.charactersTyped}\n• Tiempo chateando: ${timeUsed} minutos\n\n¡Seguí así! 💪`;
        addMessage(statsText, false);
    }

    function saveConversation() {
        const messages = Array.from(chatMessages.children)
            .filter(msg => msg.classList.contains('message'))
            .map(msg => ({
                text: msg.textContent,
                isUser: msg.classList.contains('user-message'),
                timestamp: new Date().toISOString()
            }));
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    }

    function loadConversation() {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            const messages = JSON.parse(saved);
            if (messages.length > 0) {
                chatMessages.innerHTML = '';
                messages.forEach(msg => addMessage(msg.text, msg.isUser));
                return;
            }
        }
        addMessage(greetings[currentLanguage], false);
    }

    async function handleSendMessage() {
        const message = userInput.value.trim();
        
        if (!message) return;

        if (message.startsWith('/')) {
            if (message === '/clear') handleClearChat();
            else if (message === '/help') handleHelp();
            else if (message === '/stats') showStatistics();
            else if (message === '/time') handleShowTime();
            else addMessage('❌ Comando no reconocido. Usá el botón 🔍 Ayuda para ver las opciones.', false);
            
            userInput.value = '';
            return;
        }

        addMessage(message, true);
        userInput.value = '';
        sendButton.disabled = true;

        sounds.send.play().catch(e => console.log('Audio error:', e));

        stats.messagesSent++;
        stats.charactersTyped += message.length;

        showTyping();

        try {
            const botResponse = await getBotResponse(message);
            
            hideTyping();
            addMessage(botResponse, false);
            
        } catch (error) {
            hideTyping();
            addMessage('😅 ¡Ups! Parece que hay problemas de conexión. ¿Probás de nuevo?', false);
        }

        sendButton.disabled = false;
        userInput.focus();
    }

    clearBtn.addEventListener('click', handleClearChat);
    helpBtn.addEventListener('click', handleHelp);
    timeBtn.addEventListener('click', handleShowTime);

    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        themeToggle.textContent = document.body.classList.contains('dark-theme') 
            ? '☀️ Tema Claro' 
            : '🌙 Tema Oscuro';
    });

    languageSelect.addEventListener('change', changeLanguage);

    sendButton.addEventListener('click', handleSendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    userInput.placeholder = placeholders[currentLanguage];
    userInput.focus();
});