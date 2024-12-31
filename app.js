import React, { useState, useEffect } from 'react';
import './styles.css';

const CountdownTimer = () => {
  const targetDate = new Date("October 1, 2025 00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  function calculateTimeLeft(targetDate) {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const months = Math.floor(distance / (1000 * 60 * 60 * 24 * 30.4375));
    const days = Math.floor((distance % (1000 * 60 * 60 * 24 * 30.4375)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    return { months, days, hours, minutes, seconds, distance };
  }

  function handleModeSwitch() {
    setIsDarkMode(!isDarkMode);
  }

  const { months, days, hours, minutes, seconds, distance } = timeLeft;

  return (
    <div className={`container ${isDarkMode ? "dark" : "light"}`}>
      <div className="countdown">
        <div className="timer">
          <h1>You have {months} Months {days} Days {hours} Hours {minutes} Minutes & {seconds} Seconds for the A/L Exam.</h1>
          <p className="message">The clock is ticking son, work now or you shall regret. Every second counts. Good luck!</p>
        </div>
        <div className="mode-switch">
          <label className="switch">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={handleModeSwitch}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
