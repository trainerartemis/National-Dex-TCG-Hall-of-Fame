const energyColors = [
  "#F5AC78", "#9CCF5B", "#FAE078", "#78C6E0",
  "#A890F0", "#F08030", "#B8A038", "#705898",
  "#C03028", "#A8B820"
];

const hofContainer = document.getElementById("hofContainer");

// Add new gens here only
const generations = [1,2,3,4,5,6,7,8,9];

async function loadJSON(file) {
  const res = await fetch(file);
  return await res.json();
}

async function loadAllData() {
  const users = await loadJSON("verified-users.json");

  const genData = {};
  for (const gen of generations) {
    try {
      genData[gen] = await loadJSON(`gen${gen}.json`);
    } catch {
      genData[gen] = [];
    }
  }

  renderHallOfFame(users, genData);
  updateStats(users, genData); // update stats bar
}

function renderHallOfFame(users, genData) {
  hofContainer.innerHTML = ""; // clear only the cards

  users.forEach(user => {
    const card = document.createElement("div");
    card.classList.add("hof-card");

    // Avatar
    let avatarNode;
    if (user.avatar) {
      avatarNode = new Image();
      avatarNode.src = user.avatar;
      avatarNode.alt = user.handle;
      avatarNode.width = 100;
      avatarNode.height = 100;
      avatarNode.style.borderRadius = "50%";
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      generateAvatar(canvas, user.handle);
      avatarNode = canvas;
    }

    // If user has a profile link, make avatar clickable
    if (user.profileLink) {
      const link = document.createElement("a");
      link.href = user.profileLink;
      link.target = "_blank";
      link.appendChild(avatarNode);
      card.appendChild(link);
    } else {
      card.appendChild(avatarNode);
    }

    // Name
    const nameDiv = document.createElement("div");
    nameDiv.classList.add("user-handle");
    nameDiv.textContent = user.handle;
    card.appendChild(nameDiv);

    // Platform (optional)
    if (user.platform) {
      const platformDiv = document.createElement("div");
      platformDiv.classList.add("user-platform");
      platformDiv.textContent = user.platform;
      card.appendChild(platformDiv);
    }

    // Progress Section
    const progressSection = document.createElement("div");
    progressSection.classList.add("progress-section");

    const badgeContainer = document.createElement("div");
    badgeContainer.classList.add("gen-badges");

    let completedCount = 0;

    generations.forEach(gen => {
      const badge = document.createElement("div");
      badge.classList.add("gen-badge");
      badge.textContent = `Gen ${gen}`;

      if (genData[gen].includes(user.handle)) {
        badge.classList.add("completed");
        completedCount++;
      }

      badgeContainer.appendChild(badge);
    });

    const totalDiv = document.createElement("div");
    totalDiv.classList.add("total-progress");

    if (completedCount === generations.length) {
      totalDiv.classList.add("full-complete");
      totalDiv.textContent = "🏆 National Dex Master";
      card.classList.add("master");
    } else {
      totalDiv.textContent = `${completedCount} / ${generations.length} Generations Completed`;
    }

    progressSection.appendChild(badgeContainer);
    progressSection.appendChild(totalDiv);
    card.appendChild(progressSection);

    hofContainer.appendChild(card);
  });
}

/* Avatar Generator */
function generateAvatar(canvas, handle) {
  const ctx = canvas.getContext("2d");
  let seed = 0;
  for (let i = 0; i < handle.length; i++) seed += handle.charCodeAt(i) * (i + 1);

  const bgIndex = seed % energyColors.length;
  const bgColor = energyColors[bgIndex];
  const innerColors = energyColors.filter((_, i) => i !== bgIndex);
  const innerColor = innerColors[seed % innerColors.length];

  const center = 50;

  // Background circle
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(center, center, 50, 0, Math.PI * 2);
  ctx.fill();

  // Pick a shape
  const shapes = ["circle","square","triangle","star","pentagon","hexagon","diamond","arrow","crescent","heart","spiral","crown"];
  const shape = shapes[seed % shapes.length];

  ctx.fillStyle = innerColor;
  drawShape(ctx, shape, center, center, 40);
}

function drawShape(ctx, shape, x, y, size) {
  ctx.beginPath();
  switch(shape) {
    case "circle":
      ctx.arc(x, y, size/2, 0, Math.PI*2);
      ctx.fill();
      break;
    case "square":
      ctx.fillRect(x - size/2, y - size/2, size, size);
      break;
    case "triangle":
      ctx.moveTo(x, y - size/2);
      ctx.lineTo(x + size/2, y + size/2);
      ctx.lineTo(x - size/2, y + size/2);
      ctx.closePath();
      ctx.fill();
      break;
    case "star":
      drawStar(ctx, x, y, 5, size/2, size/4);
      break;
    case "pentagon":
      drawPolygon(ctx, x, y, 5, size/2);
      break;
    case "hexagon":
      drawPolygon(ctx, x, y, 6, size/2);
      break;
    case "diamond":
      ctx.moveTo(x, y - size/2);
      ctx.lineTo(x + size/2, y);
      ctx.lineTo(x, y + size/2);
      ctx.lineTo(x - size/2, y);
      ctx.closePath();
      ctx.fill();
      break;
    case "arrow":
      ctx.moveTo(x - size/2, y + size/4);
      ctx.lineTo(x, y - size/2);
      ctx.lineTo(x + size/2, y + size/4);
      ctx.lineTo(x + size/4, y + size/4);
      ctx.lineTo(x + size/4, y + size/2);
      ctx.lineTo(x - size/4, y + size/2);
      ctx.lineTo(x - size/4, y + size/4);
      ctx.closePath();
      ctx.fill();
      break;
    case "crescent":
      ctx.arc(x, y, size/2, 0, Math.PI*2);
      ctx.fill();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x + size/6, y, size/2, 0, Math.PI*2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      break;
    case "heart":
      const topCurveHeight = size/2.2;
      ctx.moveTo(x, y + size/4);
      ctx.bezierCurveTo(x - size/2, y - topCurveHeight, x - size/4, y - topCurveHeight, x, y);
      ctx.bezierCurveTo(x + size/4, y - topCurveHeight, x + size/2, y - topCurveHeight, x, y + size/4);
      ctx.closePath();
      ctx.fill();
      break;
    case "spiral":
      let angle = 0;
      ctx.moveTo(x, y);
      while(angle < 4*Math.PI) {
        const r = (angle/(4*Math.PI)) * size/2;
        ctx.lineTo(x + r*Math.cos(angle), y + r*Math.sin(angle));
        angle += 0.1;
      }
      ctx.strokeStyle = ctx.fillStyle;
      ctx.stroke();
      break;
    case "crown":
      const crownWidth = size;
      const crownHeight = size/2;
      ctx.moveTo(x - crownWidth/2, y + crownHeight/2);
      ctx.lineTo(x - crownWidth/3, y - crownHeight/2);
      ctx.lineTo(x - crownWidth/6, y + crownHeight/4);
      ctx.lineTo(x, y - crownHeight/2);
      ctx.lineTo(x + crownWidth/6, y + crownHeight/4);
      ctx.lineTo(x + crownWidth/3, y - crownHeight/2);
      ctx.lineTo(x + crownWidth/2, y + crownHeight/2);
      ctx.closePath();
      ctx.fill();
      break;
  }
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / spikes;
  ctx.moveTo(cx, cy - outerRadius);
  for(let i=0;i<spikes;i++){
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
}

function drawPolygon(ctx, cx, cy, sides, radius) {
  const angle = (2 * Math.PI) / sides;
  ctx.moveTo(cx + radius * Math.cos(0), cy + radius * Math.sin(0));
  for(let i=1; i<sides; i++){
    ctx.lineTo(cx + radius * Math.cos(i*angle), cy + radius * Math.sin(i*angle));
  }
  ctx.closePath();
  ctx.fill();
}

function updateStats(users, genData) {
  const totalDexers = users.length;
  let fullMasters = 0;

  users.forEach(user => {
    const completedGens = Object.keys(genData).filter(gen => genData[gen].includes(user.handle)).length;
    if (completedGens === generations.length) fullMasters++;
  });

  const statsDiv = document.getElementById("hofStats");
  if (statsDiv) {
    statsDiv.innerHTML = `
      <span>Total Verified Dexers: ${totalDexers}</span> | 
      <span>Full National Dex Masters: ${fullMasters}</span>
    `;
  }
}

document.querySelector(".verification-btn").addEventListener("click", function() {
    const content = document.querySelector(".verification-content");
    content.classList.toggle("open");
});

function copyEmail() {
    const emailText = document.getElementById("verificationEmail").textContent.trim();
    navigator.clipboard.writeText(emailText).then(() => {
        const btn = document.querySelector(".copy-btn");
        btn.textContent = "Copied!";
        setTimeout(() => {
            btn.textContent = "Copy";
        }, 2000);
    });
}

document.addEventListener("DOMContentLoaded", loadAllData);