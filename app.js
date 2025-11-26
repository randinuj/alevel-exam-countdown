import React, { useState, useEffect } from 'react';
import './styles.css';

const CountdownTimer = () => {
  const examStartDate = new Date("November 10, 2025 01:00:00").getTime();
  const examEndDate = new Date("November 29, 2025 11:40:00").getTime();
  const [timeData, setTimeData] = useState(calculateTime());
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeData(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function calculateTime() {
    const now = new Date().getTime();
    
    // Before exam starts
    if (now < examStartDate) {
      const distance = examStartDate - now;
      const months = Math.floor(distance / (1000 * 60 * 60 * 24 * 30.4375));
      const days = Math.floor((distance % (1000 * 60 * 60 * 24 * 30.4375)) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      return { phase: 'before', months, days, hours, minutes, seconds };
    }
    
    // During exam
    if (now >= examStartDate && now <= examEndDate) {
      const distance = examEndDate - now;
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      return { phase: 'during', days, hours, minutes, seconds };
    }
    
    // After exam ends
    return { phase: 'after' };
  }

  function handleModeSwitch() {
    setIsDarkMode(!isDarkMode);
  }

  const renderContent = () => {
    if (timeData.phase === 'before') {
      return (
        <>
          <div className="timer-display">
            <div className="time-card pulse">
              <span className="time-value">{timeData.months}</span>
              <span className="time-label">Months</span>
            </div>
            <div className="time-card pulse">
              <span className="time-value">{timeData.days}</span>
              <span className="time-label">Days</span>
            </div>
            <div className="time-card pulse">
              <span className="time-value">{timeData.hours}</span>
              <span className="time-label">Hours</span>
            </div>
            <div className="time-card pulse">
              <span className="time-value">{timeData.minutes}</span>
              <span className="time-label">Minutes</span>
            </div>
            <div className="time-card pulse">
              <span className="time-value">{timeData.seconds}</span>
              <span className="time-label">Seconds</span>
            </div>
          </div>
          <p className="message bounce">The clock is ticking! Every second counts. Stay focused and work hard!</p>
          <p className="sub-message">Your future begins with the choices you make today. Good luck! 🎓</p>
        </>
      );
    }
    
    if (timeData.phase === 'during') {
      return (
        <>
          <h1 className="exam-status glow">🔥 EXAM IN PROGRESS 🔥</h1>
          <div className="timer-display">
            <div className="time-card shake">
              <span className="time-value">{timeData.days}</span>
              <span className="time-label">Days</span>
            </div>
            <div className="time-card shake">
              <span className="time-value">{timeData.hours}</span>
              <span className="time-label">Hours</span>
            </div>
            <div className="time-card shake">
              <span className="time-value">{timeData.minutes}</span>
              <span className="time-label">Minutes</span>
            </div>
            <div className="time-card shake">
              <span className="time-value">{timeData.seconds}</span>
              <span className="time-label">Seconds</span>
            </div>
          </div>
          <p className="message flash">Time remaining until exam completion</p>
          <p className="sub-message">Stay calm, stay focused, you've got this! 💪</p>
        </>
      );
    }
    
    // After exam
    return (
      <>
        <h1 className="exam-status celebration">🎉 EXAM COMPLETED! 🎉</h1>
        <p className="message fade-in">Congratulations on completing your A/L Exam!</p>
        <p className="sub-message">You've worked hard and given it your all. Be proud of yourself! 🌟</p>
        <p className="sub-message">Now it's time to relax and wait for the results with confidence.</p>
        <div className="confetti">✨🎊🎈🎁🏆</div>
      </>
    );
  };

  return (
    <div className={`container ${isDarkMode ? "dark" : "light"} ${timeData.phase}`}>
      <div className="countdown">
        <h2 className="title">A/L Examination Countdown</h2>
        <div className="timer">
          {renderContent()}
        </div>
        <div className="mode-switch">
          <span className="mode-label">{isDarkMode ? '🌙' : '☀️'}</span>
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