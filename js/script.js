const barcodeResults = document.getElementById('barcode-results');
const codeCount = document.getElementById('count');
const successSound = document.getElementById('successSound');
const errorSound = document.getElementById('errorSound');
const codeInput = document.getElementById('codeInput');
let detectedBarcodes = [];
let codeCounter = 0;
let errorDisplayed = false;
let video; // Declarando a variável de vídeo fora da função para ser acessível globalmente

async function startBarcodeReader() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video = document.getElementById('video'); // Atribuindo o elemento de vídeo globalmente
        video.srcObject = stream;
        await video.play();
        setInterval(readBarcode, 3000); // Escaneia a cada 3 segundos
    } catch (error) {
        console.error('Erro ao iniciar a leitura do código de barras:', error);
        displayMessage('Erro ao iniciar a leitura do código de barras.', 'error');
    }
}

async function readBarcode() {
    try {
        const barcodeDetector = new BarcodeDetector();
        const barcodes = await barcodeDetector.detect(video);

        if (barcodes.length > 0) {
            barcodes.forEach(barcode => {
                if (barcode.rawValue.length === 10) {
                    if (detectedBarcodes.includes(barcode.rawValue)) {
                        if (!errorDisplayed) {
                            displayMessage('Código de barras já lido.', 'error');
                            playErrorSound();
                            errorDisplayed = true;
                        }
                    } else {
                        if (errorDisplayed) {
                            clearError();
                        }
                        detectedBarcodes.push(barcode.rawValue);
                        const resultDiv = document.createElement('div');
                        const lastFourDigits = barcode.rawValue.slice(-4);
                        const formattedBarcode = barcode.rawValue.replace(lastFourDigits, `<span class="bold">${lastFourDigits}</span>`);
                        resultDiv.innerHTML = "Lido com sucesso: " + formattedBarcode;
                        resultDiv.classList.add('success');
                        barcodeResults.appendChild(resultDiv);
                        codeCount.textContent = detectedBarcodes.length;
                        playSuccessSound();
                        codeCounter++;
                        if (codeCounter === 3) {
                            barcodeResults.style.overflowY = 'scroll';
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Erro ao detectar código de barras:', error);
        displayMessage('Erro ao detectar código de barras.', 'error');
    }
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

function clearError() {
    const errorDiv = document.querySelector('.error');
    if (errorDiv) {
        errorDiv.remove();
        errorDisplayed = false;
    }
}

function reloadPage() {
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', function() {
    startBarcodeReader();
});

// Adicionando evento para capturar o valor digitado no input
codeInput.addEventListener('change', function() {
    const inputValue = this.value.trim();
    if (inputValue.length === 10 && !detectedBarcodes.includes(inputValue)) {
        detectedBarcodes.push(inputValue);
        const resultDiv = document.createElement('div');
        const lastFourDigits = inputValue.slice(-4);
        const formattedBarcode = inputValue.replace(lastFourDigits, `<span class="bold">${lastFourDigits}</span>`);
        resultDiv.innerHTML = "Digitado manualmente: " + formattedBarcode;
        resultDiv.classList.add('success');
        barcodeResults.appendChild(resultDiv);
        codeCount.textContent = detectedBarcodes.length;
        playSuccessSound();
        codeCounter++;
        if (codeCounter === 3) {
            barcodeResults.style.overflowY = 'scroll';
        }
    } else {
        displayMessage('Código inválido ou já lido.', 'error');
        playErrorSound();
    }
    this.value = ''; // Limpar o input depois de adicionar o código
});
