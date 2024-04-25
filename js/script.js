const barcodeResults = document.getElementById('barcode-results');
const codeCount = document.getElementById('codeCount');
const successSound = document.getElementById('successSound');
const errorSound = document.getElementById('errorSound');
let detectedBarcodes = [];
let codeCounter = 0;
let errorDisplayed = false;

async function startBarcodeReader() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const video = document.getElementById('video');
        video.srcObject = stream;
        await video.play();
        console.log("Câmera ativada com sucesso!");

        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: video
            },
            decoder: {
                readers: ["ean_reader"]
            }
        }, function (err) {
            if (err) {
                console.error('Erro ao inicializar o Quagga:', err);
                displayMessage('Erro ao iniciar a leitura do código de barras.', 'error');
                return;
            }
            console.log("Quagga inicializado com sucesso!");
            Quagga.start();
        });

        Quagga.onDetected(function (data) {
            const code = data.codeResult.code;
            if (code.length === 10 && !detectedBarcodes.includes(code)) {
                detectedBarcodes.push(code);
                const lastFourDigits = code.slice(-4);
                const formattedBarcode = code.replace(lastFourDigits, `<span class="bold">${lastFourDigits}</span>`);
                const resultDiv = document.createElement('div');
                resultDiv.innerHTML = "Lido com sucesso: " + formattedBarcode;
                resultDiv.classList.add('success');
                barcodeResults.appendChild(resultDiv);
                codeCount.textContent = detectedBarcodes.length;
                playSuccessSound();
                codeCounter++;
                if (codeCounter % 2 === 0) {
                    barcodeResults.style.overflowY = 'scroll';
                }
            }
        });

    } catch (error) {
        console.error('Erro ao iniciar a leitura do código de barras:', error);
        displayMessage('Erro ao iniciar a leitura do código de barras.', 'error');
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

function reloadPage() {
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', function() {
    startBarcodeReader();
});
