const { jsPDF } = window.jspdf;

// GHS Picker
const ghsPicker = document.getElementById('ghsPicker');
for (let i = 1; i <= 9; i++) {
    const id = i.toString().padStart(3, '0');
    const div = document.createElement('div');
    div.className = "flex justify-center p-1 border rounded cursor-pointer bg-white";
    div.innerHTML = `<img src="ghs_${id}.png" class="w-6 h-6 object-contain pointer-events-none"><input type="checkbox" value="${id}" class="ghs-check hidden">`;
    div.onclick = () => {
        const cb = div.querySelector('input');
        if (!cb.checked && document.querySelectorAll('.ghs-check:checked').length >= 6) return;
        cb.checked = !cb.checked;
        div.classList.toggle('border-[#064e3b]', cb.checked);
        div.classList.toggle('bg-green-50', cb.checked);
        updatePreview();
    };
    ghsPicker.appendChild(div);
}

function updatePreview() {
    let sub = document.getElementById('substanceName').value || "STOFFNAME";
    const sig = document.getElementById('signal').value;
    const size = document.getElementById('substanceSize').value;
    
    // Footer Daten
    const bet = document.getElementById('betrieb').value || "Betrieb";
    const abt = document.getElementById('abteilung').value || "Abteilung";
    const fir = document.getElementById('firma').value || "Firma";
    const adr = document.getElementById('adresse').value || "Adresse";

    document.getElementById('substanceSizeDisplay').innerText = size;

    const subEl = document.getElementById('pSubstance');
    subEl.innerText = sub.toUpperCase();
    
    const previewWidth = document.getElementById('previewCard').offsetWidth;
    const scale = previewWidth / 297;
    subEl.style.fontSize = (size * 0.3527 * scale) + "px";

    document.getElementById('pSignal').innerText = sig;
    document.getElementById('pBetrieb').innerText = bet;
    document.getElementById('pAbteilung').innerText = abt;
    document.getElementById('pFirma').innerText = fir;
    document.getElementById('pAdresse').innerText = adr;

    const ghsZone = document.getElementById('pGhs');
    ghsZone.innerHTML = '';
    document.querySelectorAll('.ghs-check:checked').forEach(cb => {
        const img = document.createElement('img');
        img.src = `ghs_${cb.value}.png`;
        ghsZone.appendChild(img);
    });
}

document.querySelectorAll('input, select, textarea').forEach(el => el.addEventListener('input', updatePreview));

document.getElementById('pdfBtn').onclick = () => {
    const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
    
    const sub = document.getElementById('substanceName').value.toUpperCase() || "STOFFNAME";
    const sig = document.getElementById('signal').value;
    const size = parseInt(document.getElementById('substanceSize').value);
    
    const bet = document.getElementById('betrieb').value;
    const abt = document.getElementById('abteilung').value;
    const fir = document.getElementById('firma').value;
    const adr = document.getElementById('adresse').value;
    
    const selectedGhs = Array.from(document.querySelectorAll('.ghs-check:checked')).map(cb => cb.value);

    // 1. STOFFNAME
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    
    const splitSub = doc.splitTextToSize(sub, 270); 
    const lineHeightMm = (size * 0.3527) * 1.15; 
    const totalHeight = splitSub.length * lineHeightMm;
    const startY = 70 - (totalHeight / 2) + (lineHeightMm / 2);

    doc.text(splitSub, 148.5, startY, { align: 'center', baseline: 'middle' });

    // 2. GHS & SIGNAL
    const iconSize = 25;
    const gap = 5;
    const totalW = (selectedGhs.length * iconSize) + ((selectedGhs.length - 1) * gap);
    let startX = 148.5 - (totalW / 2);
    
    if(sig) startX -= 20;

    selectedGhs.forEach((id, i) => {
        doc.addImage(`ghs_${id}.png`, 'PNG', startX + (i * (iconSize + gap)), 147, iconSize, iconSize);
    });

    if(sig) {
        doc.setFontSize(30);
        doc.setFont("helvetica", "bolditalic");
        doc.text(sig, startX + totalW + 10, 160, { baseline: 'middle' });
    }

    // 3. FOOTER - GROSS & FETT
    doc.setFont("helvetica", "bold");
    
    // Betrieb & Abteilung (Links)
    doc.setFontSize(22);
    doc.text(`${bet} | ${abt}`, 20, 198, { baseline: 'middle' });
    
    // Firma & Adresse (Rechts)
    doc.setFontSize(22);
    doc.text(fir, 277, 193, { align: 'right', baseline: 'middle' });
    doc.setFontSize(16); // Adresse einen Hauch kleiner, damit es optisch abgehoben ist
    doc.text(adr, 277, 203, { align: 'right', baseline: 'middle' });

    doc.save(`Tankwagen_Label.pdf`);
};

updatePreview();
