import React, { useState, useEffect } from 'react';
import './styles.css';

function App() {
  const [mode, setMode] = useState('dark');

  const targetDate = new Date("October 1, 2025 00:00:00").getTime();
  
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const timeLeft = targetDate - now;

      const months = Math.floor(timeLeft / (1000 * 60 * 60 * 24 * 30));
      const days = Math.floor((timeLeft % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setCountdown(`You have ${months} Months ${days} Days ${hours} Hours ${minutes} Minutes & ${seconds} Seconds for the A/L Exam.`);
    };

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const handleModeSwitch = () => {
    if (mode === 'dark') {
      setMode('blue');
    } else if (mode === 'blue') {
      setMode('white');
    } else {
      setMode('dark');
    }
  };

  return (
    <div className={`app ${mode}-mode`}>
      <div className="container">
        <h1>Countdown to A/L Exam</h1>
        <div id="countdown" className="countdown">{countdown}</div>
        <div className="message">
          The clock is ticking son, work now or you shall regret. Every second counts. Good luck!
        </div>
        <button onClick={handleModeSwitch} className="mode-button">
          Switch to {mode === 'dark' ? 'Blue Mode' : mode === 'blue' ? 'White Mode' : 'Dark Mode'}
        </button>
      </div>
    </div>
  );
}

export default App;
