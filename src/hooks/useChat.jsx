import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [aiModel, setAiModel] = useState("gemini"); // Default to OpenAI
  const [isListening, setListeningAnimation] = useState(false);

  // Function to process text with OpenAI API
  const processWithOpenAI = async (text) => {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: text }],
          max_tokens: 150
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Error with OpenAI processing:", error);
      return text; // Fallback to original text on error
    }
  };

  // Function to process text with Gemini API
  const processWithGemini = async (text) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 150
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error with Gemini processing:", error);
      return text; // Fallback to original text on error
    }
  };

  // Main chat function
  const chat = async (message) => {
    setLoading(true);
    
    try {
      // Pre-process the message with AI if needed
      let processedMessage = message;
      
      if (aiModel === "openai") {
        processedMessage = await processWithOpenAI(message);
      } else if (aiModel === "gemini") {
        processedMessage = await processWithGemini(message);
      }
      
      // Send to backend
      const data = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: processedMessage }),
      });
      
      const resp = (await data.json()).messages;
      setMessages((messages) => [...messages, ...resp]);
    } catch (error) {
      console.error("Error in chat processing:", error);
      // Add error message
      setMessages((messages) => [
        ...messages, 
        { text: "Sorry, I couldn't process your message. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  const toggleAiModel = () => {
    setAiModel(prev => prev === "openai" ? "gemini" : "openai");
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        aiModel,
        toggleAiModel,
        isListening,
        setListeningAnimation
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};