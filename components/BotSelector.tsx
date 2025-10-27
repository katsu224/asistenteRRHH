import React from 'react';
import { Bot } from '../types';

/**
 * @interface BotSelectorProps
 * @property {Bot[]} bots - An array of available bot objects.
 * @property {(bot: Bot) => void} onSelect - Callback function to handle the selection of a bot.
 */
interface BotSelectorProps {
  bots: Bot[];
  onSelect: (bot: Bot) => void;
}

/**
 * A component that displays a selection of bots for the user to choose from.
 * @param {BotSelectorProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered bot selector component.
 */
const BotSelector: React.FC<BotSelectorProps> = ({ bots, onSelect }) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Bienvenido al Asistente de RRHH</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">Por favor, selecciona el asistente de tu empresa para comenzar.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-7xl">
        {bots.map((bot) => (
          <div
            key={bot.id}
            onClick={() => onSelect(bot)}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center cursor-pointer transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
            style={{'--hover-shadow-color': bot.themeColor} as React.CSSProperties}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 10px 15px -3px ${bot.themeColor}40, 0 4px 6px -2px ${bot.themeColor}20`}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = ''}
          >
            <img src={bot.image} alt={bot.name} className="w-32 h-32 object-contain rounded-full mb-4" />
            <span className="font-semibold text-gray-700 dark:text-gray-200">{bot.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BotSelector;
