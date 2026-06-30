const motivationQuotes = [
  "Tu es plus fort que tu ne le penses.",
  "Chaque jour est une nouvelle chance.",
  "La discipline bat le talent."
];

const stressQuotes = [
  "Respire. Tu vas y arriver.",
  "Le calme est une superpuissance.",
  "Tu n’es pas seul, tu progresses."
];

const sportQuotes = [
  "Un champion s’entraîne, un perdant se plaint.",
  "La sueur d’aujourd’hui est la victoire de demain."
];
function generateLocalAI(input) {
  const text = input.toLowerCase();

  if (text.includes("stress")) return stressQuotes[Math.floor(Math.random() * stressQuotes.length)];
  if (text.includes("sport")) return sportQuotes[Math.floor(Math.random() * sportQuotes.length)];
  if (text.includes("motivation")) return motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)];

  return motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)];
}
const userInput = document.getElementById("ai-input").value;
const quote = generateLocalAI(userInput);
document.getElementById("ai-output").innerText = quote;
