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

export function surpriseMe() {
  const promptInput = document.getElementById('prompt');
  promptInput.value = prompts[Math.floor(Math.random() * prompts.length)];
}

export async function generateImage() {
  const prompt = document.getElementById('prompt')?.value;
  const btn = document.getElementById('genBtn');
  const resultSection = document.getElementById('result-section');
  const loading = document.getElementById('loading');
  const output = document.getElementById('outputImage');
  const dl = document.getElementById('downloadLink');

  if (!prompt) return alert("Please enter a prompt!");

  btn.disabled = true;
  document.getElementById('btnText').innerText = "Processing...";
  document.getElementById('btnLoader').classList.remove('hidden');
  loading.classList.remove('hidden');
  resultSection.classList.add('hidden');

  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://image-api.aatanukrpaul.workers.dev/';
    const apiKey = import.meta.env.VITE_API_KEY || 'SECRET_HOLDER';

    const response = await fetch(apiBase, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt }),
    });

    if (response.status === 403 || response.status === 400)
      throw new Error("Safety filter blocked this prompt.");
    if (!response.ok) throw new Error("CORS or Server Error.");

    const blob = await response.blob();
    output.src = URL.createObjectURL(blob);
    dl.href = output.src;
    
    // Trigger Split Layout
    document.getElementById('app-container').classList.add('is-split');
    resultSection.classList.remove('hidden');
    setTimeout(() => {
      resultSection.classList.remove('opacity-0', 'translate-x-10', 'lg:translate-x-20', 'scale-95');
    }, 50);

  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    btn.disabled = false;
    document.getElementById('btnText').innerText = "Generate Masterpiece";
    document.getElementById('btnLoader').classList.add('hidden');
    loading.classList.add('hidden');
  }
}

export function handleReset() {
  const app = document.getElementById('app-container');
  const resultSection = document.getElementById('result-section');
  
  // Start return animation
  app.classList.remove('is-split');
  resultSection.classList.add('opacity-0', 'scale-95', 'translate-x-10', 'lg:translate-x-20');
  
  // Clean up content after animation is mostly done
  setTimeout(() => {
    resultSection.classList.add('hidden');
    document.getElementById('prompt').value = '';
    const output = document.getElementById('outputImage');
    output.src = '';
    
    // Explicitly reset any remaining state
    resultSection.style.opacity = '';
    resultSection.style.transform = '';
  }, 800);
}

// Initial setup
window.surpriseMe = surpriseMe;
window.generateImage = generateImage;
window.handleReset = handleReset;
