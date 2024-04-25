const barcodeResults = document.getElementById('barcode-results');
const codeCount = document.getElementById('count');
const successSound = document.getElementById('successSound');
const errorSound = document.getElementById('errorSound');
const codeInput = document.getElementById('codeInput');
let detectedBarcodes = [];
let codeCounter = 0;
let errorDisplayed = false;
let video;

async function startBarcodeReader() {
    try {
        video = document.getElementById('video');
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        await video.play();
        setInterval(readBarcode, 3000);
        console.log("Câmera ativada com sucesso!");
    } catch (error) {
        console.error('Erro ao iniciar a leitura do código de barras:', error);
        displayMessage('Erro ao iniciar a leitura do código de barras.', 'error');
    }
}

async function readBarcode() {
    // Lógica de leitura de códigos de barras permanece a mesma
}

function sendToWhatsApp() {
    const whatsappMessage = "Códigos lidos: *" + detectedBarcodes.length + "*\n\n" + detectedBarcodes.join("\n");
    window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(whatsappMessage), "_blank");
}

function playSuccessSound() {
    successSound.play();
}

function playErrorSound() {
    errorSound.play();
}

function displayMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.classList.add(type);
    barcodeResults.appendChild(messageDiv);
    barcodeResults.scrollTop = barcodeResults.scrollHeight;
}

function reloadPage() {
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', function() {
    startBarcodeReader();
});

codeInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        const inputValue = this.value.trim();
        if (inputValue.length > 0 && !detectedBarcodes.includes(inputValue)) {
            detectedBarcodes.push(inputValue);
            const resultDiv = document.createElement('div');
            resultDiv.textContent = "Digitado manualmente: " + inputValue;
            resultDiv.classList.add('success');
            barcodeResults.appendChild(resultDiv);
            codeCount.textContent = detectedBarcodes.length;
            playSuccessSound();
            codeCounter++;
            if (codeCounter === 3) {
                barcodeResults.style.overflowY = 'scroll';
            }
        } else {
            displayMessage('Valor inválido ou já inserido.', 'error');
            playErrorSound();
        }
        this.value = '';
    }
});
