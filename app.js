const countdownElement = document.getElementById('countdown');
const modeSwitcher = document.getElementById('modeSwitcher');

const targetDate = new Date("October 1, 2025 00:00:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = targetDate - now;

    const months = Math.floor(timeLeft / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((timeLeft % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    countdownElement.innerHTML = `You have ${months} Months ${days} Days ${hours} Hours ${minutes} Minutes & ${seconds} Seconds for the A/L Exam.`;
}

setInterval(updateCountdown, 1000);

let currentMode = 'dark';

modeSwitcher.addEventListener('click', () => {
    if (currentMode === 'dark') {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('blue-mode');
        modeSwitcher.textContent = "Switch to White Mode";
        currentMode = 'blue';
    } else if (currentMode === 'blue') {
        document.body.classList.remove('blue-mode');
        document.body.classList.add('white-mode');
        modeSwitcher.textContent = "Switch to Dark Mode";
        currentMode = 'white';
    } else {
        document.body.classList.remove('white-mode');
        document.body.classList.add('dark-mode');
        modeSwitcher.textContent = "Switch to Blue Mode";
        currentMode = 'dark';
    }
});
