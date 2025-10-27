
import React, { useState } from 'react';

interface HandbookInputProps {
  onSubmit: (content: string) => void;
  isLoading: boolean;
}

const HandbookInput: React.FC<HandbookInputProps> = ({ onSubmit, isLoading }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-blue-500 p-3 rounded-full text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.747-8.247l11.494 4.994-11.494 4.995 11.494-11.494z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.747-8.247l11.494 4.994-11.494 4.995 11.494-11.494zM4 12.75l8-3.5 8 3.5-8 3.5-8-3.5zM4 6.253l8 3.5 8-3.5-8-3.5-8 3.5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Asistente de Manual de Empleado</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Pega el contenido de tu manual para comenzar.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Pega aquí el texto completo de tu manual de empleado..."
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!content.trim() || isLoading}
              className="mt-6 w-full flex justify-center items-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                'Iniciar Asistente'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HandbookInput;
