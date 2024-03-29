import React, { useState } from "react";
import OpenAI from 'openai';
import logo from './logo.svg';
import './App.css';
import Chatbot from "./Components/Chatbot";


// const openai = new OpenAI({
//   apiKey: process.env.PUBLIC_OPENAI_API_KEY,
//   dangerouslyAllowBrowser: true
// })

// const initialMessage = `
// Welcome, brave hero to the last part of your epic journey. You have fought the Trojans on the beach. You have witnessed the might of the gods descend among mortal men, seen fair Aphrodite save her favored, and watched as brave Hector died.

// At last, you may begin to head home. But the first question - to make sacrifices to the gods or return home as quickly as you can?
// `.trim()
function App() {

  return (
    <div className="App">
      <header className="App-header">
        <Chatbot />
      </header>
    </div>
  );
}

export default App;
