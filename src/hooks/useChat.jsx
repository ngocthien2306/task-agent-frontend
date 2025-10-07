import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { profileService } from "../services/api";
import { useSubscription } from "./useSubscription";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const [aiModel, setAiModel] = useState("gemini"); // Default to Gemini
  const [isListening, setListeningAnimation] = useState(false);
  const [taskData, setTaskData] = useState(null); // For task toast display
  const [userProfile, setUserProfile] = useState(null); // Cache user profile
  const [subscriptionLimitExceeded, setSubscriptionLimitExceeded] = useState(null); // Track subscription limits
  const { user, authFetch } = useAuth(); // Get current user from auth context
  const { checkCanProceed, loadSubscription } = useSubscription(); // Get subscription functions

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

  // Function to get user profile data from localStorage
  const getUserProfileFromStorage = () => {
    if (!user) {
      return null;
    }

    try {
      console.log('🔄 Using user profile from localStorage...');
      console.log('User data from localStorage:', user);
      
      // User data is already available in the user object from localStorage
      const profile = user;
      
      console.log('✅ User profile loaded from localStorage:', {
        timezone: profile.personality?.timezone || 'UTC',
        name: `${profile.profile?.first_name || ''} ${profile.profile?.last_name || ''}`.trim(),
        occupation: profile.profile?.occupation,
        communication_style: profile.personality?.communication_style,
        interaction_preference: profile.personality?.interaction_preference,
        onboarding_completed: profile.profile?.is_onboarding_completed
      });
      
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.warn('⚠️ Failed to load user profile from localStorage:', error.message);
      return null;
    }
  };

  // Main chat function
  const chat = async (message) => {
    // Check if user is authenticated
    if (!user || !user.username) {
      console.error("User not authenticated");
      setMessages((messages) => [
        ...messages, 
        { text: "Please log in to use the chat feature." }
      ]);
      return;
    }

    setLoading(true);
    setSubscriptionLimitExceeded(null); // Clear previous limit errors
    
    try {
      // Check subscription limits before proceeding
      console.log('🔒 Checking subscription limits before chat...');
      const limitCheck = await checkCanProceed(1000); // Estimate 1000 tokens
      
      if (!limitCheck.can_proceed) {
        console.log('❌ Subscription limit exceeded:', limitCheck.reason);
        
        // Set subscription limit error for UI to handle
        setSubscriptionLimitExceeded({
          reason: limitCheck.reason,
          suggested_action: limitCheck.suggested_action,
          subscription: limitCheck.subscription
        });
        
        // Add limit exceeded message
        setMessages((messages) => [
          ...messages,
          {
            text: limitCheck.reason.includes('token') 
              ? "Bạn đã sử dụng hết quota tokens. Vui lòng nâng cấp gói để tiếp tục chat."
              : "Bạn đã đạt giới hạn requests. Vui lòng nâng cấp gói để tiếp tục.",
            facialExpression: "concerned",
            animation: "Talking_0"
          }
        ]);
        
        return; // Don't proceed with chat
      }
      
      console.log('✅ Subscription check passed, proceeding with chat...');
      // Get user profile from localStorage or use cached
      let currentUserProfile = userProfile;
      if (!currentUserProfile) {
        currentUserProfile = getUserProfileFromStorage();
      }

      // Pre-process the message with AI if needed
      let processedMessage = message;
      
      if (aiModel === "openai") {
        processedMessage = await processWithOpenAI(message);
      } else if (aiModel === "gemini") {
        processedMessage = await processWithGemini(message);
      }

      // Prepare userContext for BE - mapping from MongoDB structure
      const userContext = currentUserProfile ? {
        // Personal Info (from profile object)
        first_name: currentUserProfile.profile?.first_name || currentUserProfile.first_name,
        last_name: currentUserProfile.profile?.last_name || currentUserProfile.last_name,
        phone: currentUserProfile.profile?.phone,
        date_of_birth: currentUserProfile.profile?.date_of_birth,
        avatar_url: currentUserProfile.profile?.avatar_url,
        
        // Professional Info (from profile object)
        occupation: currentUserProfile.profile?.occupation,
        company: currentUserProfile.profile?.company,
        industry: currentUserProfile.profile?.industry,
        position_level: currentUserProfile.profile?.position_level,
        work_location: currentUserProfile.profile?.work_location,
        
        // Personality & Preferences (from personality object)
        work_style: currentUserProfile.personality?.work_style || 'organized',
        communication_style: currentUserProfile.personality?.communication_style || 'friendly',
        interaction_preference: currentUserProfile.personality?.interaction_preference || 'detailed',
        preferred_tone: currentUserProfile.personality?.preferred_tone || 'helpful',
        working_hours: currentUserProfile.personality?.working_hours,
        break_style: currentUserProfile.personality?.break_style,
        
        // Goals & Motivation (from personality object)
        primary_goals: currentUserProfile.personality?.primary_goals || [],
        task_priorities: currentUserProfile.personality?.task_priorities,
        planning_horizon: currentUserProfile.personality?.planning_horizon,
        success_metrics: currentUserProfile.personality?.success_metrics || [],
        motivation_factors: currentUserProfile.personality?.motivation_factors || [],
        
        // Learning & Growth
        interests: currentUserProfile.profile?.interests || currentUserProfile.personality?.interests || [],
        learning_style: currentUserProfile.personality?.learning_style,
        stress_management: currentUserProfile.personality?.stress_management || [],
        
        // Technical Preferences (from personality object)
        timezone: currentUserProfile.personality?.timezone || 'UTC',
        language_preference: currentUserProfile.personality?.language_preference || 'en',
        notification_preferences: currentUserProfile.personality?.notification_preferences || [],
        device_usage: currentUserProfile.personality?.device_usage,
        tech_level: currentUserProfile.personality?.tech_level,
        
        // AI Assistant Settings (from personality object)
        custom_instructions: currentUserProfile.personality?.custom_instructions,
        reminder_style: currentUserProfile.personality?.reminder_style,
        feedback_preference: currentUserProfile.personality?.feedback_preference,
        privacy_level: currentUserProfile.personality?.privacy_level,
        
        // Onboarding Status (from profile object)
        is_onboarding_completed: currentUserProfile.profile?.is_onboarding_completed || false
      } : {};

      const requestBody = { 
        message: processedMessage,
        userId: user.username,  // Use user.id from localStorage
        sessionId: user.username || 'default', // Use user.id as sessionId for persistence
        userContext: userContext  // Send user profile data
      };

      console.log('📤 Full request body being sent to BE:', {
        message: requestBody.message?.substring(0, 50) + '...',
        userId: requestBody.userId,
        sessionId: requestBody.sessionId,
        userContext: {
          timezone: userContext.timezone,
          name: `${userContext.first_name || ''} ${userContext.last_name || ''}`.trim(),
          occupation: userContext.occupation,
          communication_style: userContext.communication_style,
          interaction_preference: userContext.interaction_preference,
          hasData: Object.keys(userContext).length > 0
        }
      });
      
      // Send to Node.js backend with user_id and userContext
      const data = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      
      // Handle subscription limit errors from backend
      if (data.status === 429) {
        const errorData = await data.json().catch(() => ({}));
        
        if (errorData.error === 'subscription_limit_exceeded') {
          console.log('❌ Backend returned subscription limit exceeded:', errorData);
          
          setSubscriptionLimitExceeded({
            reason: errorData.details?.reason || 'Subscription limit exceeded',
            suggested_action: errorData.details?.suggested_action || 'upgrade_plan',
            subscription: errorData.details?.subscription
          });
          
          // Add limit exceeded message
          setMessages((messages) => [
            ...messages,
            {
              text: errorData.message || "Bạn đã đạt giới hạn subscription. Vui lòng nâng cấp gói để tiếp tục.",
              facialExpression: "concerned",
              animation: "Talking_0"
            }
          ]);
          
          return; // Don't continue processing
        }
      }
      
      if (!data.ok) {
        throw new Error(`HTTP error! status: ${data.status}`);
      }
      
      const responseData = await data.json();
      console.log('🔍 Full response data:', responseData);
      
      const resp = responseData.messages;
      setMessages((messages) => [...messages, ...resp]);

      // Handle task data for toast display
      if (responseData.taskData && responseData.taskData.displayType === 'toast') {
        console.log('📋 Displaying task data toast:', responseData.taskData);
        setTaskData(responseData.taskData);
      } else {
        console.log('❌ No taskData found in response or wrong displayType:', {
          hasTaskData: !!responseData.taskData,
          displayType: responseData.taskData?.displayType
        });
      }
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

  const onTaskToastClose = () => {
    setTaskData(null);
  };

  const onSubscriptionLimitClose = () => {
    setSubscriptionLimitExceeded(null);
  };

  const toggleAiModel = () => {
    setAiModel(prev => prev === "openai" ? "gemini" : "openai");
  };

  // Function to refresh user profile (useful when profile is updated)
  const refreshUserProfile = () => {
    console.log('🔄 Refreshing user profile from localStorage...');
    const profile = getUserProfileFromStorage();
    return profile;
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  // Load user profile when user changes (login/logout)
  useEffect(() => {
    if (user && user.username && !userProfile) {
      console.log('👤 User logged in, loading profile from localStorage for chat context...');
      getUserProfileFromStorage();
    } else if (!user) {
      // Clear profile on logout
      setUserProfile(null);
    }
  }, [user]);

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
        setListeningAnimation,
        taskData,
        onTaskToastClose,
        userProfile,
        refreshUserProfile,
        subscriptionLimitExceeded,
        onSubscriptionLimitClose
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