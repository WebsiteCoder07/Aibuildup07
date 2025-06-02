const ChatApp = () => {
    const [messages, setMessages] = React.useState([]);
    const [userInput, setUserInput] = React.useState("");
    const [uploadedText, setUploadedText] = React.useState("");

    // AI Voice Modulation
    const speakText = (text) => {
        const speech = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(speech);
    };

    // Send Message to Netlify Serverless Function
    const sendMessage = async () => {
        if (!userInput.trim()) return;

        const newMessages = [...messages, { role: "user", content: userInput }];
        setMessages(newMessages);
        setUserInput("");

        try {
            const response = await fetch("/.netlify/functions/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userInput })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            const botReply = data.reply;

            setMessages([...newMessages, { role: "bot", content: botReply }]);
            speakText(botReply);
        } catch (error) {
            console.error("API Error:", error);
            setMessages([...newMessages, { role: "bot", content: "⚠️ AI could not process your request. Try again later!" }]);
        }
    };

    // File Upload Handling
    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (file.size > 2 * 1024 * 1024) {
            alert("⚠️ File too large! Please upload a file under 2MB.");
            return;
        }

        if (!file.type.startsWith("text/")) {
            alert("⚠️ Invalid file format! Please upload a text file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setUploadedText(reader.result);
        reader.readAsText(file);
    };

    return (
        <div className="chat-container">
            <h2>Advanced AI Chatbot</h2>
            <div id="chat-box">
                {messages.map((msg, index) => (
                    <p key={index}>
                        <strong>{msg.role === "user" ? "You:" : "AI:"}</strong> {msg.content}
                    </p>
                ))}
            </div>

            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Type a message..." />
            <button onClick={sendMessage}>Send</button>

            <h3>Upload File:</h3>
            <input type="file" onChange={handleFileUpload} />
            <textarea value={uploadedText} readOnly rows="5"></textarea>
        </div>
    );
};

// Render ChatApp into #root
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(ChatApp));
console.log("✅ React Component Rendered Successfully!");
