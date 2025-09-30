import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../hooks/useChat";

// Import the Cherry component
import { CherryBlossomFalling } from "./Animations/CherryBlossomFalling";
import Profile from "./Profile/Profile";
import { TaskToast } from "./Tasks/TaskToast";

export const UI = ({ hidden, user, onLogout }) => {
  const input = useRef();
  const navigate = useNavigate();
  const { chat, loading, cameraZoomed, setCameraZoomed, message, setListeningAnimation, taskData, onTaskToastClose } = useChat();
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [speechLanguage, setSpeechLanguage] = useState('auto'); // Auto-detect language
  const [lastDetectedLanguage, setLastDetectedLanguage] = useState('vi-VN');
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [showBlossoms, setShowBlossoms] = useState(true);
  const [customBackground, setCustomBackground] = useState(null);
  const [showMessage, setShowMessage] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const fileInputRef = useRef(null);
  
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
      // Remove background classes
      backgroundOptions.forEach(option => {
        if (option.class) body.classList.remove(option.class);
      });
      
      // Set default image as background
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
      
      // Smart language handling for Vietnamese + English
      let targetLanguage = speechLanguage;
      
      if (speechLanguage === 'auto') {
        // Auto-detect: start with last detected or default to Vietnamese
        targetLanguage = lastDetectedLanguage;
      } else if (speechLanguage === 'mixed') {
        // Mixed mode: start with Vietnamese but be ready to switch
        targetLanguage = 'vi-VN';
      }
      
      recognition.lang = targetLanguage;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 5; // More alternatives for mixed language
      
      console.log(`🎤 Starting speech recognition with: ${targetLanguage} (mode: ${speechLanguage})`);

      recognition.onstart = () => {
        setIsListening(true);
        setListeningAnimation(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update input with final transcript or show interim results
        if (finalTranscript) {
          input.current.value = finalTranscript;
          console.log('🎯 Final Vietnamese transcript:', finalTranscript);
        } else if (interimTranscript) {
          // Show interim results with visual indicator
          input.current.value = interimTranscript;
          input.current.style.fontStyle = 'italic';
          input.current.style.color = '#666';
        }
        
        // Reset styling when final
        if (finalTranscript) {
          input.current.style.fontStyle = 'normal';
          input.current.style.color = '';
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setListeningAnimation(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Handle specific Vietnamese speech recognition errors
        if (event.error === 'no-speech') {
          console.log('📢 No speech detected. Try speaking louder in Vietnamese.');
        } else if (event.error === 'network') {
          console.log('🌐 Network error. Speech recognition needs internet connection.');
        } else if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone permission for Vietnamese speech recognition.');
        }
        
        setIsListening(false);
        setListeningAnimation(false);
        
        // Reset input styling on error
        if (input.current) {
          input.current.style.fontStyle = 'normal';
          input.current.style.color = '';
        }
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
      setListeningAnimation(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Language options for speech recognition
  const languageOptions = [
    { code: 'auto', label: '🌐 Auto (VI/EN)', name: 'Auto-detect' },
    { code: 'vi-VN', label: '🇻🇳 Tiếng Việt', name: 'Vietnamese' },
    { code: 'en-US', label: '🇺🇸 English', name: 'English' },
    { code: 'mixed', label: '🔄 Mixed (VI+EN)', name: 'Vietnamese + English' },
    { code: 'en-GB', label: '🇬🇧 English (UK)', name: 'English (UK)' },
    { code: 'ja-JP', label: '🇯🇵 日本語', name: 'Japanese' },
    { code: 'ko-KR', label: '🇰🇷 한국어', name: 'Korean' },
    { code: 'zh-CN', label: '🇨🇳 中文', name: 'Chinese' }
  ];

  // Language detection utility
  const detectLanguage = (text) => {
    // Simple heuristic to detect Vietnamese vs English
    const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    const englishWords = /\b(the|and|or|but|in|on|at|to|for|of|with|by|from|up|about|into|over|after|this|that|these|those|is|are|was|were|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can|cannot|shall|must)\b/i;
    
    if (vietnameseChars.test(text)) {
      return 'vi-VN';
    } else if (englishWords.test(text)) {
      return 'en-US';
    }
    return lastDetectedLanguage; // Fallback to last detected
  };

  const handleLanguageChange = (languageCode) => {
    setSpeechLanguage(languageCode);
    console.log(`🗣️ Speech language changed to: ${languageCode}`);
    
    // Stop current recognition if running
    if (isListening) {
      stopListening();
    }
  };

  // Toggle cherry blossoms function
  const toggleBlossoms = () => {
    setShowBlossoms(!showBlossoms);
  };
  
  const toggleMessage = () => {
    setShowMessage(!showMessage);
  };

  // Open file picker directly
  const openImagePicker = () => {
    fileInputRef.current.click();
  };
  
  // Use default image
  const useDefaultImage = () => {
    // Remove background classes
    const body = document.querySelector("body");
    backgroundOptions.forEach(option => {
      if (option.class) body.classList.remove(option.class);
    });
    
    // Set default image as background
    document.body.style.backgroundImage = `url(${defaultImageUrl})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    setCustomBackground(defaultImageUrl);
    
    // Set index to customImage position in array
    const customImageIndex = backgroundOptions.findIndex(option => option.class === "customImage");
    if (customImageIndex !== -1) {
      setBackgroundIndex(customImageIndex);
    }
  };

  // Render button component for reusability
  const Button = ({ onClick, className, title, children, size = "w-12 h-12" }) => (
    <button
      onClick={onClick}
      className={`pointer-events-auto ${className} ${size} rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center`}
      title={title}
    >
      {children}
    </button>
  );

  if (hidden) {
    return null;
  }

  return (
    <>
      {/* Cherry Blossom falling effect */}
      {showBlossoms && <CherryBlossomFalling />}
      
      {/* Hidden file input for image selection */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleFileSelect}
      />
      
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 p-2 sm:p-4 pointer-events-none">
        <div className="backdrop-blur-md bg-white bg-opacity-60 p-4 sm:p-6 rounded-xl shadow-lg border border-white border-opacity-30 max-w-full sm:max-w-md mx-auto">
          <h1 className="font-bold text-xl sm:text-2xl text-gray-800 mb-1">AI Assistant</h1>
          <p className="text-gray-600 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="3"/>
              </svg>
              <span className="truncate">Welcome back, {user?.profile.first_name} {user?.profile.last_name}!</span>
            </span>
          </p>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed right-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
        <div className="backdrop-blur-md bg-white bg-opacity-30 rounded-xl shadow-lg border border-white border-opacity-30 p-3">
          <div className="flex flex-col gap-3 w-16">
            
            {/* Main Functions Group */}
            <div className="space-y-2 pb-2 border-b border-white border-opacity-30">
              <Button
                onClick={() => setShowProfile(true)}
                className="bg-teal-500 hover:bg-teal-600 text-white"
                title="View Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Button>

              <Button
                onClick={() => navigate('/calendar')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                title="View Calendar (Tasks & Schedule)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
                </svg>
              </Button>

              <Button
                onClick={() => navigate('/animation-studio')}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                title="Animation Studio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.953l-7.108 4.061A1.125 1.125 0 013 16.811z" />
                </svg>
              </Button>
            </div>

            {/* Camera Control */}
            <div className="space-y-2 pb-2 border-b border-white border-opacity-30">
              <Button
                onClick={() => setCameraZoomed(!cameraZoomed)}
                className="bg-purple-500 hover:bg-purple-600 text-white"
                title={cameraZoomed ? "Zoom Out Camera" : "Zoom In Camera"}
              >
                {cameraZoomed ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                  </svg>
                )}
              </Button>
            </div>

            {/* Background Settings */}
            <div className="space-y-2 pb-2 border-b border-white border-opacity-30">
              <Button
                onClick={cycleBackground}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                title={`Current background: ${backgroundOptions[backgroundIndex].name}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </Button>
              
              <Button
                onClick={openImagePicker}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
                title="Choose custom background image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </Button>
              
              <Button
                onClick={useDefaultImage}
                className="bg-teal-500 hover:bg-teal-600 text-white"
                title="Use default background image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
                </svg>
              </Button>
            </div>

            {/* Effects */}
            <div className="space-y-2 pb-2 border-b border-white border-opacity-30">
              <Button
                onClick={toggleBlossoms}
                className="bg-pink-500 hover:bg-pink-600 text-white"
                title={showBlossoms ? "Turn off cherry blossoms" : "Turn on cherry blossoms"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </Button>
              
              <Button
                onClick={toggleMessage}
                className="bg-rose-500 hover:bg-rose-600 text-white"
                title={showMessage ? "Hide celebration message" : "Show celebration message"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </Button>
            </div>

            {/* Logout Button */}
            <div className="pt-2">
              <Button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-10 p-2 pointer-events-none">
        <div className="backdrop-blur-md bg-white bg-opacity-30 rounded-xl shadow-lg border border-white border-opacity-30 p-2 mx-2">
          <div className="flex justify-around items-center gap-1">
            {/* Main Functions for Mobile */}
            <Button
              onClick={() => setShowProfile(true)}
              className="bg-teal-500 hover:bg-teal-600 text-white"
              title="View Profile"
              size="w-10 h-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>

            <Button
              onClick={() => navigate('/calendar')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              title="View Calendar"
              size="w-10 h-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
              </svg>
            </Button>

            <Button
              onClick={() => navigate('/animation-studio')}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
              title="Animation Studio"
              size="w-10 h-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.953l-7.108 4.061A1.125 1.125 0 013 16.811z" />
              </svg>
            </Button>

            <Button
              onClick={() => setCameraZoomed(!cameraZoomed)}
              className="bg-purple-500 hover:bg-purple-600 text-white"
              title={cameraZoomed ? "Zoom Out Camera" : "Zoom In Camera"}
              size="w-10 h-10"
            >
              {cameraZoomed ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                </svg>
              )}
            </Button>

            <Button
              onClick={cycleBackground}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              title={`Background: ${backgroundOptions[backgroundIndex].name}`}
              size="w-10 h-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </Button>

            <Button
              onClick={toggleBlossoms}
              className="bg-pink-500 hover:bg-pink-600 text-white"
              title={showBlossoms ? "Turn off effects" : "Turn on effects"}
              size="w-10 h-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </Button>

            <Button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white"
              title="Logout"
              size="w-10 h-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Input - Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-10 p-2 sm:p-4 pointer-events-none">
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto max-w-screen-sm w-full mx-auto">
          {/* Language Selector */}
          <div className="relative">
            <select
              value={speechLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="appearance-none bg-white bg-opacity-80 backdrop-blur-md border border-white border-opacity-50 rounded-lg px-2 py-2 pr-8 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 hover:bg-opacity-90"
              title="Select speech recognition language"
            >
              {languageOptions.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-white">
                  {lang.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="w-full relative">
            <input
              className="w-full placeholder:text-gray-600 placeholder:italic p-3 sm:p-4 pr-12 sm:pr-14 rounded-xl bg-white bg-opacity-80 backdrop-blur-md shadow-lg border border-white border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              placeholder={`Ask me anything about tasks... (${languageOptions.find(l => l.code === speechLanguage)?.name || 'Vietnamese'})`}
              ref={input}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />
            <button
              onClick={toggleListening}
              className={`absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
                isListening 
                  ? "bg-red-500 text-white animate-pulse shadow-lg" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title={`${isListening ? "Stop listening" : "Start voice input"} (${languageOptions.find(l => l.code === speechLanguage)?.name})`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 sm:w-5 sm:h-5"
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
            className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 sm:p-4 px-6 sm:px-8 font-semibold rounded-xl shadow-lg transition-all duration-200 text-sm sm:text-base ${
              loading || message 
                ? "cursor-not-allowed opacity-50" 
                : "hover:shadow-xl hover:scale-105"
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="hidden sm:inline">Processing</span>
              </div>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>
      
      {/* Profile Modal */}
      {showProfile && (
        <Profile onClose={() => setShowProfile(false)} />
      )}

      {/* Task Toast */}
      <TaskToast taskData={taskData} onClose={onTaskToastClose} />
    </>
  );
};