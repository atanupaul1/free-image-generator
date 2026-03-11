// Constants and State
const prompts = [
  "A hyper-realistic portrait of a celestial knight made of stardust and cosmic nebulae, standing on a shattered moon, cinematic lighting, 8k resolution, ethereal atmosphere",
  "An intricate steampunk clockwork owl perched on a weathered leather book, golden gears visible through glass wings, soft workshop lighting, macro photography, hyper-detailed",
  "A vast bioluminescent ocean cavern where glowing jellyfish whales drift through deep blue water, ancient crystalline ruins on the seafloor, dreamlike, surrealism, digital painting",
  "A serene Japanese tea house floating on a bed of clouds during sunset, cherry blossom petals drifting in the wind, soft orange and pink lighting, Zen atmosphere, high-detail landscape",
  "A futuristic cyberpunk samurai standing in a rainy neon alley, reflection of skyscrapers in puddles, glowing katana, cinematic wide shot, moody atmosphere, sharp focus",
  "A cute fluffy dragon curled up inside a giant hollowed-out crystal, sleeping peacefully, shimmering scales, magical lighting, fantasy art style, vibrant colors",
  "An ancient library where books are made of flowing water and light, floating shelves, ethereal scholars, masterpiece, mystical atmosphere, extreme detail",
  "A surreal portrait of a woman whose hair transitions into a flight of monarch butterflies, vibrant colors, dreamlike composition, soft focus, oil painting style",
];

let currentRatio = '1:1';
let history = JSON.parse(localStorage.getItem('gen_history') || '[]');

// UI Helpers
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="text-lg">${type === 'success' ? '✨' : '❌'}</span>
    <span class="font-bold text-sm text-white/90">${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

export function setRatio(ratio) {
  currentRatio = ratio;
  document.querySelectorAll('.ratio-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.ratio === ratio);
  });
}

export function surpriseMe() {
  const promptInput = document.getElementById('prompt');
  promptInput.value = prompts[Math.floor(Math.random() * prompts.length)];
}

// History Management
function saveToHistory(item) {
  history.unshift(item);
  if (history.length > 20) history.pop();
  localStorage.setItem('gen_history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const grid = document.getElementById('history-grid');
  const section = document.getElementById('history-section');
  
  if (history.length === 0) {
    section.classList.add('hidden', 'opacity-0');
    return;
  }

  section.classList.remove('hidden');
  setTimeout(() => section.classList.remove('opacity-0'), 50);
  
  grid.innerHTML = history.map((item, idx) => `
    <div class="history-item" onclick="viewHistoryItem(${idx})">
      <img src="${item.url}" alt="Generated">
      <div class="overlay">
        <p class="text-[10px] text-white/80 line-clamp-1 font-bold">${item.prompt}</p>
      </div>
    </div>
  `).join('');
}

export function clearHistory() {
  if (confirm('Clear all your past creations?')) {
    history = [];
    localStorage.removeItem('gen_history');
    renderHistory();
    showToast('History cleared', 'success');
  }
}

window.viewHistoryItem = (idx) => {
  const item = history[idx];
  const output = document.getElementById('outputImage');
  const dl = document.getElementById('downloadLink');
  const promptInput = document.getElementById('prompt');
  
  output.src = item.url;
  dl.href = item.url;
  promptInput.value = item.prompt;
  document.getElementById('result-prompt-display').innerText = item.prompt;
  
  document.getElementById('app-container').classList.add('is-split');
  document.getElementById('result-section').classList.remove('hidden', 'opacity-0', 'translate-x-10', 'scale-95');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Core Generation
export async function generateImage() {
  const prompt = document.getElementById('prompt')?.value;
  const style = document.getElementById('style-preset')?.value;
  const btn = document.getElementById('genBtn');
  const resultSection = document.getElementById('result-section');
  const loading = document.getElementById('loading');
  const output = document.getElementById('outputImage');
  const dl = document.getElementById('downloadLink');

  if (!prompt) return showToast("Enter a prompt first!", "error");

  const fullPrompt = `${style ? style + " style: " : ""}${prompt} --ar ${currentRatio}`;

  btn.disabled = true;
  document.getElementById('btnText').innerText = "Working Magic...";
  document.getElementById('btnLoader').classList.remove('hidden');
  loading.classList.remove('hidden');

  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://image-api.aatanukrpaul.workers.dev/';
    const apiKey = import.meta.env.VITE_API_KEY;

    const response = await fetch(apiBase, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: fullPrompt }),
    });

    if (response.status === 403 || response.status === 400)
      throw new Error("Safety filter blocked this prompt.");
    if (!response.ok) throw new Error("API Error. Please try again.");

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    
    // Process Success
    output.src = imageUrl;
    dl.href = imageUrl;
    document.getElementById('result-prompt-display').innerText = prompt;
    
    saveToHistory({ url: imageUrl, prompt: prompt, date: new Date().toISOString() });
    showToast("Masterpiece created!", "success");

    document.getElementById('app-container').classList.add('is-split');
    resultSection.classList.remove('hidden');
    setTimeout(() => {
      resultSection.classList.remove('opacity-0', 'translate-x-10', 'scale-95');
    }, 50);

  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    document.getElementById('btnText').innerText = "Generate Masterpiece";
    document.getElementById('btnLoader').classList.add('hidden');
    loading.classList.add('hidden');
  }
}

export function copyPrompt() {
  const prompt = document.getElementById('prompt').value;
  navigator.clipboard.writeText(prompt);
  showToast("Prompt copied to clipboard!", "success");
}

export function handleReset() {
  const app = document.getElementById('app-container');
  const resultSection = document.getElementById('result-section');
  
  app.classList.remove('is-split');
  resultSection.classList.add('opacity-0', 'scale-95', 'translate-x-10');
  
  setTimeout(() => {
    resultSection.classList.add('hidden');
    document.getElementById('prompt').value = '';
    document.getElementById('outputImage').src = '';
  }, 800);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  renderHistory();
});

window.surpriseMe = surpriseMe;
window.generateImage = generateImage;
window.handleReset = handleReset;
window.setRatio = setRatio;
window.copyPrompt = copyPrompt;
window.clearHistory = clearHistory;
