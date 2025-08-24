import { useRef, useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";

// Import the Cherry  component
import { CherryBlossomFalling } from "./CherryBlossomFalling";
import { Message } from "./Message";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message, setListeningAnimation } = useChat();
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [showBlossoms, setShowBlossoms] = useState(true); // State to toggle cherry blossoms
  const [customBackground, setCustomBackground] = useState(null); // State for custom image background
  const [showMessage, setShowMessage] = useState(true); 
  const fileInputRef = useRef(null); // Reference for hidden file input
  
  // Đường dẫn ảnh mặc định - thay thế URL này bằng URL của ảnh mà bạn muốn sử dụng
  const defaultImageUrl = "cherry.jpg";
  
  // Define an array of background colors/classes with descriptive names
  const backgroundOptions = [
    { class: "", name: "Default (Pink-Purple)" },
    { class: "greenScreen", name: "Green" },
    { class: "blueScreen", name: "Blue-Purple-Yellow" },
    { class: "purpleScreen", name: "Blue-Purple" },
    { class: "pinkScreen", name: "Pink-Red" },
    { class: "orangeScreen", name: "Orange-Yellow" },
    { class: "redScreen", name: "Pink-Purple-Blue" },
    { class: "customImage", name: "Custom Image" }
  ];

  const cycleBackground = () => {
    const body = document.querySelector("body");
    
    // Remove all background classes first
    backgroundOptions.forEach(option => {
      if (option.class) body.classList.remove(option.class);
    });
    
    // Calculate next index (cycling through the array)
    const nextIndex = (backgroundIndex + 1) % backgroundOptions.length;
    setBackgroundIndex(nextIndex);
    
    // If selecting custom image option, use default image
    if (backgroundOptions[nextIndex].class === "customImage") {
      // Xóa các background class
      backgroundOptions.forEach(option => {
        if (option.class) body.classList.remove(option.class);
      });
      
      // Đặt ảnh mặc định làm background
      document.body.style.backgroundImage = `url(${defaultImageUrl})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
      setCustomBackground(defaultImageUrl);
      return;
    }
    
    // Otherwise add the new background class if it's not empty
    if (backgroundOptions[nextIndex].class) {
      body.classList.add(backgroundOptions[nextIndex].class);
    }
    
    // When changing background type, remove any custom background image
    if (customBackground) {
      document.body.style.backgroundImage = "";
      setCustomBackground(null);
    }
  };

  // Handle file selection for background image
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.match('image.*')) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setCustomBackground(imageUrl);
        
        // Set the background image on the body
        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";
      };
      
      reader.readAsDataURL(file);
    } else {
      // If no valid image was selected, revert to previous background
      const prevIndex = (backgroundIndex - 1 + backgroundOptions.length) % backgroundOptions.length;
      setBackgroundIndex(prevIndex);
      
      if (backgroundOptions[prevIndex].class) {
        document.querySelector("body").classList.add(backgroundOptions[prevIndex].class);
      }
    }
  };

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message && text.trim()) {
      chat(text);
      input.current.value = "";
    }
  };

  const startListening = () => {
    if (isListening) return;

    try {
      // Browser Speech Recognition API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in your browser.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setListeningAnimation(true); // Trigger listening animation
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        input.current.value = transcript;
      };

      recognition.onend = () => {
        setIsListening(false);
        setListeningAnimation(false); // Stop listening animation
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setListeningAnimation(false); // Stop listening animation on error
      };

      setSpeechRecognition(recognition);
      recognition.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  };

  const stopListening = () => {
    if (speechRecognition) {
      speechRecognition.stop();
      setIsListening(false);
      setListeningAnimation(false); // Stop listening animation
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Toggle cherry blossoms function
  const toggleBlossoms = () => {
    setShowBlossoms(!showBlossoms);
  };
  
  const toggleMessage = () => {
    setShowMessage(!showMessage);
  };

  // Open file picker directly (alternative to cycling)
  const openImagePicker = () => {
    fileInputRef.current.click();
  };
  
  // Sử dụng ảnh mặc định
  const useDefaultImage = () => {
    // Xóa các background class
    const body = document.querySelector("body");
    backgroundOptions.forEach(option => {
      if (option.class) body.classList.remove(option.class);
    });
    
    // Đặt ảnh mặc định làm background
    document.body.style.backgroundImage = `url(${defaultImageUrl})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    setCustomBackground(defaultImageUrl);
    
    // Đặt index thành vị trí của customImage trong mảng
    const customImageIndex = backgroundOptions.findIndex(option => option.class === "customImage");
    if (customImageIndex !== -1) {
      setBackgroundIndex(customImageIndex);
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      {/* Cherry Blossom falling effect */}
      {showBlossoms && <CherryBlossomFalling />}
      
      {/* {showMessage && <Message />} */}
      
      {/* Hidden file input for image selection */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileSelect}
      />
      
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
          <h1 className="font-black text-xl">AI Agent Task Management</h1>
          <p>I will always schedule for you</p>
        </div>
        <div className="w-full flex flex-col items-end justify-center gap-4">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          <button
            onClick={cycleBackground}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
            title={`Current background: ${backgroundOptions[backgroundIndex].name}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </button>
          {/* Button to choose custom image */}
          <button
            onClick={openImagePicker}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
            title="Choose custom background image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </button>
          
          {/* Button to use default image */}
          <button
            onClick={useDefaultImage}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
            title="Use default background image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
              />
            </svg>
          </button>
          
          {/* Cherry blossoms toggle button */}
          <button
            onClick={toggleBlossoms}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
            title={showBlossoms ? "Turn off cherry blossoms" : "Turn on cherry blossoms"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </button>
          
          <button
            onClick={toggleMessage}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
            title={showMessage ? "Hide celebration message" : "Show celebration message"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <div className="w-full relative">
            <input
              className="w-full placeholder:text-gray-800 placeholder:italic p-4 pr-12 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
              placeholder="Type a message..."
              ref={input}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />
            <button
              onClick={toggleListening}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                isListening ? "bg-pink-500 text-white animate-pulse" : "bg-gray-200 text-gray-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            </button>
          </div>
          <button
            disabled={loading || message}
            onClick={sendMessage}
            className={`bg-pink-500 hover:bg-pink-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${
              loading || message ? "cursor-not-allowed opacity-30" : ""
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};