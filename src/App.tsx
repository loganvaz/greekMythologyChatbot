import React, { useState } from "react";
import logo from './logo.svg';
import './App.css';
import Chatbot from "./Components/Chatbot";

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
