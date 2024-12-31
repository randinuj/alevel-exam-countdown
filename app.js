import React, { useState, useEffect } from 'react';
import './styles.css';

function App() {
  const [mode, setMode] = useState('dark'); // Default to dark mode

  const targetDate = new Date("October 1, 2025 00:00:00").getTime(); // Countdown target date

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

    return () => clearInterval(interval); // Cleanup the interval when component unmounts
  }, []);

  const handleModeSwitch = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`app ${mode}-mode`}>
      <div className="container">
        <h1>Countdown to A/L Exam</h1>
        <div id="countdown" className="countdown">{countdown}</div>
        <div className="message">
          The clock is ticking son, work now or you shall regret. Every second counts. Good luck!
        </div>
        <label className="switch">
          <input type="checkbox" checked={mode === 'light'} onChange={handleModeSwitch} />
          <span className="slider"></span>
        </label>
      </div>
    </div>
  );
}

export default App;
