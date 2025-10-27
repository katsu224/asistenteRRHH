import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import BotSelector from './components/BotSelector';
import KnowledgeManager from './components/KnowledgeManager';
import { Message, ActionType, Bot, KnowledgeItem } from './types';
import * as geminiService from './services/geminiService';
import { bots } from './assets/bots';

/**
 * The main component of the application that orchestrates the entire chat interface.
 * It manages the application's state, including bot selection, knowledge base,
 * chat history, and user input. It also handles interactions with the Gemini API service.
 * @returns {React.ReactElement} The rendered component.
 */
const App: React.FC = () => {
  // State for the current view of the application ('selecting' or 'chatting')
  const [appState, setAppState] = useState<'selecting' | 'chatting'>('selecting');
  // State for the currently selected bot
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  // State for the collection of knowledge items (documents, images)
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);
  // State for the history of chat messages
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  // State for the user's current input in the chat box
  const [userInput, setUserInput] = useState('');
  // State to indicate if the application is currently waiting for a response from the API
  const [isLoading, setIsLoading] = useState(false);
  // State to store any error messages
  const [error, setError] = useState<string | null>(null);

  // Ref to the end of the chat history, used for auto-scrolling
  const chatEndRef = useRef<HTMLDivElement>(null);

  /**
   * Effect to automatically scroll to the latest message in the chat history.
   * This runs whenever the chat history or the loading state changes.
   */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  /**
   * Handles the selection of a bot from the BotSelector component.
   * It sets the selected bot, changes the app state to 'chatting', and initializes the chat with a welcome message.
   * @param {Bot} bot The bot object that was selected by the user.
   */
  const handleBotSelect = (bot: Bot) => {
    setSelectedBot(bot);
    setAppState('chatting');
    setChatHistory([
      {
        id: crypto.randomUUID(),
        role: 'model',
        text: `¡Hola! Soy ${bot.name}, tu asistente de RRHH. Para empezar, añade documentos, PDFs o imágenes a mi memoria usando el panel de la izquierda. Luego, hazme cualquier pregunta.`,
      },
    ]);
  };

  /**
   * Adds a new knowledge item to the knowledge base.
   * @param {KnowledgeItem} item The knowledge item to add.
   */
  const handleAddKnowledge = (item: KnowledgeItem) => {
    setKnowledgeBase((prev) => [...prev, item]);
  };

  /**
   * Handles the submission of a new message by the user.
   * It sends the user's message to the Gemini API and updates the chat history with the response.
   * @param {React.FormEvent} e The form event.
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !selectedBot) return;
    if (knowledgeBase.length === 0) {
        setError("Por favor, añade al menos un documento o imagen a la memoria antes de preguntar.");
        return;
    }

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text: userInput };
    setChatHistory((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await geminiService.getAnswer(knowledgeBase, userInput, selectedBot.name);
      const modelMessage: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        text: responseText,
        relatedQuestionId: userMessage.id,
      };
      setChatHistory((prev) => [...prev, modelMessage]);
    } catch (err) {
      setError('Hubo un error al contactar al asistente. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handles follow-up actions triggered by the user from a chat message (e.g., explain, example, image).
   * It calls the appropriate Gemini API service based on the action and updates the chat history.
   * @param {ActionType} action The type of action to perform.
   * @param {Message} message The message on which the action is being performed.
   */
  const handleAction = async (action: ActionType, message: Message) => {
    if (!selectedBot) return;
    setIsLoading(true);
    setError(null);

    const relatedUserMessage = chatHistory.find(m => m.id === message.relatedQuestionId && m.role === 'user');
    if (!relatedUserMessage) {
        setError("No se pudo encontrar la pregunta original para esta acción.");
        setIsLoading(false);
        return;
    }
    const originalQuestion = relatedUserMessage.text;

    try {
        let response: Partial<Message> = {};
        if (action === 'explain') {
            response.text = await geminiService.reExplain(knowledgeBase, originalQuestion, message.text, selectedBot.name);
        } else if (action === 'example') {
            response.text = await geminiService.getExample(knowledgeBase, originalQuestion, message.text, selectedBot.name);
        } else if (action === 'image') {
            response.text = 'Aquí tienes una representación visual del concepto:';
            response.imageUrl = await geminiService.generateImageForConcept(originalQuestion, message.text);
        }

        const modelMessage: Message = {
            id: crypto.randomUUID(), role: 'model', text: response.text || '',
            imageUrl: response.imageUrl, relatedQuestionId: relatedUserMessage.id,
        };
        setChatHistory((prev) => [...prev, modelMessage]);
    } catch (err) {
      setError('Hubo un error al procesar la acción. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (appState === 'selecting') {
    return <BotSelector bots={bots} onSelect={handleBotSelect} />;
  }

  if (!selectedBot) return null; // Should not happen

  return (
    <div className="flex h-screen font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <KnowledgeManager knowledgeBase={knowledgeBase} onAddKnowledge={handleAddKnowledge} bot={selectedBot} />
      
      <div className="flex flex-col flex-1">
        <header 
          className="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center space-x-4 sticky top-0 z-10 border-b-4"
          style={{ borderBottomColor: selectedBot.themeColor }}
        >
          <img src={selectedBot.image} alt={`${selectedBot.name} Avatar`} className="w-12 h-12 rounded-full" />
          <h1 className="text-xl font-bold">{selectedBot.name} - Asistente de RRHH</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {chatHistory.map((msg) => (
              <ChatMessage key={msg.id} message={msg} botImage={selectedBot.image} themeColor={selectedBot.themeColor} onAction={handleAction} isLoading={isLoading} />
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <img src={selectedBot.image} alt="Bot Avatar" className="w-10 h-10 rounded-full" />
                <div className="max-w-xl p-4 rounded-2xl bg-white dark:bg-gray-700 flex items-center space-x-2 shadow-md">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            )}
            {error && <div className="text-red-500 text-center p-2 bg-red-100 dark:bg-red-900 rounded-md">{error}</div>}
            <div ref={chatEndRef} />
          </div>
        </main>

        <footer className="bg-white dark:bg-gray-800 p-4 sticky bottom-0 z-10 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center space-x-4">
            <input
              type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)}
              placeholder="Escribe tu pregunta aquí..."
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:outline-none"
              style={{'--tw-ring-color': selectedBot.themeColor} as React.CSSProperties}
              disabled={isLoading}
            />
            <button
              type="submit" disabled={isLoading || !userInput.trim()}
              className="text-white rounded-full p-3 transition-all disabled:cursor-not-allowed"
              style={{ backgroundColor: isLoading || !userInput.trim() ? '#9CA3AF' : selectedBot.themeColor, '--hover-color': selectedBot.darkThemeColor } as React.CSSProperties}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = isLoading || !userInput.trim() ? '#9CA3AF' : selectedBot.darkThemeColor}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = isLoading || !userInput.trim() ? '#9CA3AF' : selectedBot.themeColor}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default App;
