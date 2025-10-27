<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI HR Assistant

This project is a customizable AI-powered Human Resources assistant built with React and powered by the Gemini API. It allows employees to get instant answers to their HR-related questions by interacting with a chatbot that has been trained on your company's internal documentation.

## Features

- **Customizable Bots**: Easily configure different HR assistant bots with unique personalities and appearances.
- **Knowledge Base**: Upload your company's HR documents (PDFs, images, or plain text) to create a knowledge base for the AI.
- **Interactive Chat**: A user-friendly chat interface for employees to ask questions and get answers.
- **Follow-up Actions**: Users can ask for explanations, examples, or even generate images to better understand the information.
- **Responsive Design**: The application is designed to work on various screen sizes.

## Project Structure

The project is structured as follows:

- **`public/`**: Contains the static assets and the main `index.html` file.
- **`src/`**: Contains the main source code for the application.
  - **`assets/`**: Static assets like images and bot definitions.
  - **`components/`**: Reusable React components that make up the UI.
  - **`services/`**: Handles communication with the Gemini API.
  - **`types.ts`**: TypeScript type definitions.
  - **`App.tsx`**: The main application component.
  - **`index.tsx`**: The entry point of the application.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment variables:**
   - Create a file named `.env.local` in the root of the project.
   - Add your Gemini API key to the `.env.local` file:
     ```
     VITE_GEMINI_API_KEY=your_gemini_api_key
     ```
   - *Note: The `VITE_` prefix is required for environment variables to be exposed to the client-side code in a Vite project.*

4. **Run the application:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## Usage

1. **Select a Bot**: When you first launch the application, you'll be prompted to select a bot.
2. **Add to Knowledge Base**: Use the "Knowledge Manager" on the left-hand side to upload documents or add text. This will provide the context for the AI's answers.
3. **Ask Questions**: Type your questions in the chatbox at the bottom of the screen.
4. **Use Follow-up Actions**: After the bot responds, you can use the "Explain," "Example," or "Image" buttons to get more information.
