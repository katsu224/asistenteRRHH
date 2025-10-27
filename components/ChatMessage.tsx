import React from 'react';
import { Message, ActionType } from '../types';

/**
 * @interface ActionButtonsProps
 * @property {(action: ActionType) => void} onAction - Callback function to handle follow-up actions.
 * @property {boolean} disabled - Whether the action buttons should be disabled.
 */
interface ActionButtonsProps {
  onAction: (action: ActionType) => void;
  disabled: boolean;
}

/**
 * A reusable button component for the action buttons.
 * @param {object} props - The props for the component.
 * @param {React.ReactNode} props.icon - The icon to display in the button.
 * @param {string} props.label - The text label for the button.
 * @param {() => void} props.onClick - The function to call when the button is clicked.
 * @param {boolean} props.disabled - Whether the button should be disabled.
 * @returns {React.ReactElement} The rendered button component.
 */
const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; disabled: boolean }> = ({ icon, label, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      {icon}
      <span>{label}</span>
    </button>
);

/**
 * A component that renders a set of action buttons for a chat message.
 * @param {ActionButtonsProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered action buttons component.
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({ onAction, disabled }) => (
  <div className="flex items-center gap-2 mt-3 flex-wrap">
      <ActionButton
          onClick={() => onAction('explain')}
          disabled={disabled}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V4a2 2 0 012-2h6.172a2 2 0 011.414.586l3.828 3.828A2 2 0 0117 8z" /></svg>}
          label="Explicar"
      />
      <ActionButton
          onClick={() => onAction('example')}
          disabled={disabled}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
          label="Ejemplo"
      />
      <ActionButton
          onClick={() => onAction('image')}
          disabled={disabled}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          label="Imagen"
      />
  </div>
);

/**
 * @interface ChatMessageProps
 * @property {Message} message - The message object to display.
 * @property {string} botImage - The URL of the bot's avatar image.
 * @property {string} themeColor - The theme color for the user's messages.
 * @property {(action: ActionType, message: Message) => void} onAction - Callback function to handle follow-up actions.
 * @property {boolean} isLoading - Whether the application is currently in a loading state.
 */
interface ChatMessageProps {
  message: Message;
  botImage: string;
  themeColor: string;
  onAction: (action: ActionType, message: Message) => void;
  isLoading: boolean;
}

/**
 * A component that displays a single chat message, either from the user or the model.
 * It includes the message text, an optional image, and action buttons for model messages.
 * @param {ChatMessageProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered chat message component.
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({ message, botImage, themeColor, onAction, isLoading }) => {
  const isModel = message.role === 'model';

  return (
    <div className={`flex items-start gap-3 ${isModel ? '' : 'justify-end'}`}>
      {isModel && (
        <img src={botImage} alt="Bot Avatar" className="w-10 h-10 rounded-full flex-shrink-0" />
      )}
      <div className={`max-w-xl p-4 rounded-2xl shadow-md ${isModel ? 'bg-white dark:bg-gray-700' : 'text-white'}`}
           style={!isModel ? { backgroundColor: themeColor } : {}}>
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{message.text}</div>
        {message.imageUrl && (
            <div className="mt-4">
                <img src={message.imageUrl} alt="Generated visual concept" className="rounded-lg max-w-sm w-full" />
            </div>
        )}
        {isModel && !message.imageUrl && (
          <ActionButtons 
            onAction={(action) => onAction(action, message)} 
            disabled={isLoading}
          />
        )}
      </div>
       {!isModel && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-800 dark:text-gray-200 font-bold">
          <span>TÚ</span>
        </div>
      )}
    </div>
  );
};
