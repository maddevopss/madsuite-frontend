import { useState,  useState, useRef, useEffect } from "react";
import api from "../../api/api";
import "./AiCopilot.css";
import { Button } from "../ui";

export default function AiCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Je suis l'assistant MADSuite Copilot. Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    const newHistory = [...messages, userMessage];
    
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      // Send the entire conversation history context
      const response = await api.post("/ai-assistant/chat", { messages: newHistory });
      
      if (response.data && response.data.data && response.data.data.reply) {
        setMessages([...newHistory, { role: "assistant", content: response.data.data.reply }]);
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      console.error("Erreur Copilot:", error);
      let errorMsg = "Désolé, une erreur est survenue lors de la communication avec l'IA.";
      if (error.response?.status === 503) {
        errorMsg = "L'assistant IA n'est pas configuré sur ce serveur (Clé API manquante).";
      }
      setMessages([...newHistory, { role: "assistant", content: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`ai-copilot-container ${isOpen ? "open" : ""}`}>
      {isOpen && (
        <div className="ai-copilot-window">
          <div className="ai-copilot-header">
            <h3>MADSuite Copilot</h3>
            <button className="ai-copilot-close" onClick={toggleChat} aria-label="Fermer">×</button>
          </div>
          <div className="ai-copilot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message ${msg.role}`}>
                <div className="ai-message-bubble">
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="ai-message assistant">
                <div className="ai-message-bubble loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
          <form className="ai-copilot-input-area" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Posez votre question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" variant="primary" disabled={isLoading || !input.trim()}>
              Envoyer
            </Button>
          </form>
        </div>
      )}
      
      <button className="ai-copilot-launcher" onClick={toggleChat} aria-label="Ouvrir Copilot">
        {isOpen ? "✕" : "✨"}
      </button>
    </div>
  );
}
