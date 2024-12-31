const CountdownTimer = () => {
    const targetDate = new Date("2025-10-01T00:00:00").getTime();
    const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());

    React.useEffect(() => {
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, []);

    function calculateTimeLeft() {
        const now = new Date().getTime();
        const diff = targetDate - now;
        if (diff <= 0) return null;
        const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
        const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return { months, days, hours, minutes, seconds };
    }

    return React.createElement(
        "div",
        { className: "container" },
        React.createElement("h1", null, "Countdown to A/L Exam"),
        timeLeft
            ? React.createElement(
                  "div",
                  { className: "countdown" },
                  `You have ${timeLeft.months} Months ${timeLeft.days} Days ${timeLeft.hours} Hours ${timeLeft.minutes} Minutes & ${timeLeft.seconds} Seconds.`
              )
            : React.createElement(
                  "div",
                  { className: "countdown" },
                  "The A/L Exam has started. Good luck!"
              ),
        React.createElement(
            "div",
            { className: "message" },
            timeLeft
                ? "The clock is ticking. Work hard now or regret later. Every second counts!"
                : "It's time to shine. All the best!"
        )
    );
};

ReactDOM.render(
    React.createElement(CountdownTimer, null),
    document.getElementById("root")
);
