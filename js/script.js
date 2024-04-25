const barcodeResults = document.getElementById('barcode-results');
const codeCount = document.getElementById('count');
const successSound = document.getElementById('successSound');
const errorSound = document.getElementById('errorSound');
const codeInput = document.getElementById('codeInput');
let detectedBarcodes = [];
let codeCounter = 0;
let errorDisplayed = false;
let videoStream;

async function startBarcodeReader() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const video = document.getElementById('video');
        video.srcObject = videoStream;
        await video.play();
        setInterval(readBarcode, 3000);
    } catch (error) {
        console.error('Erro ao iniciar a leitura do código de barras:', error);
        displayMessage('Erro ao iniciar a leitura do código de barras.', 'error');
    }
}

async function readBarcode() {
    try {
        const barcodeDetector = new BarcodeDetector();
        const barcodes = await barcodeDetector.detect(videoStream);

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

codeInput.addEventListener('input', function() {
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
});
