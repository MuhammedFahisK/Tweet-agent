import React from 'react';
import './App.css'; // You can keep the default styles for now
import IdeaGenerator from './IdeaGenerator.tsx'; // Make sure IdeaGenerator.jsx is in the same src folder

function App() {
  return (
    // The main container for your app
    <div className="app">
      <header className="app-header">
        <h1>AI Tweet Idea Generator</h1>
        <p>
          Let our AI assistant help you craft the perfect tweet.
        </p>
      </header>

      <main className='mb-5'>
        {/* This is where your functional component will be rendered */}
        <IdeaGenerator />
      </main>

    </div>
  );
}

export default App;