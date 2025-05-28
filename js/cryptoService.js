// js/cryptoService.js

/**
 * Semeia o gerador de números aleatórios do Forge usando window.crypto.
 * Isso deve ser feito uma vez, idealmente quando a página carrega ou antes da primeira operação de criptografia.
 */
function seedForgeRandom() {
    if (window.forge && window.crypto && window.crypto.getRandomValues) {
        try {
            const randomBytes = new Uint8Array(32);
            window.crypto.getRandomValues(randomBytes);
            let byteString = '';
            for (let i = 0; i < randomBytes.length; ++i) {
                byteString += String.fromCharCode(randomBytes[i]);
            }
            forge.random.collect(byteString);
            // console.log("Forge PRNG semeado com window.crypto.");
        } catch (e) {
            console.warn("Não foi possível semear o Forge PRNG com window.crypto:", e);
        }
    } else {
        console.warn("window.crypto.getRandomValues não está disponível para semear o Forge PRNG. A geração de IV pode ser menos segura ou falhar.");
    }
}

// Chama a função de semeadura quando o script é carregado
// ou quando a biblioteca Forge estiver disponível.
if (window.forge) {
    seedForgeRandom();
} else {
    // Se Forge não carregou ainda (improvável se o script dele veio antes), espera o DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        if (window.forge) seedForgeRandom();
    });
}

/**
 * Criptografa o texto usando AES-256-GCM com a biblioteca Forge.js.
 * @param {string} plaintext - O texto a ser criptografado (ex: um JSON em formato de string).
 * @param {string} keyHex - A chave de 32 bytes (256 bits) em formato hexadecimal.
 * @returns {object|null} - Um objeto contendo os dados criptografados e metadados em Base64, ou null em caso de erro.
 * Ex: { encryptedData: "...", iv: "...", authTag: "..." }
 */
function encryptPayloadWithForge(plaintext, keyHex) {
    if (typeof forge === 'undefined') {
        console.error("Forge.js não está carregado!");
        // A função displayMessage não está definida aqui, então vamos logar e retornar null.
        // A chamada da UI deve tratar o null.
        return null;
    }
    try {
        // Tenta semear o PRNG do Forge se necessário
        if (!forge.random.getBytesSync) { // Checagem se o PRNG está pronto
            if (window.crypto && window.crypto.getRandomValues) {
                const randomBytes = new Uint8Array(32);
                window.crypto.getRandomValues(randomBytes);
                let byteString = '';
                for (let i = 0; i < randomBytes.length; ++i) byteString += String.fromCharCode(randomBytes[i]);
                forge.random.collect(byteString);
            } else {
                console.warn("window.crypto.getRandomValues não disponível para semear Forge PRNG para encryptPayloadWithForge.");
            }
        }

        const keyBytes = forge.util.hexToBytes(keyHex);
        const ivBytes = forge.random.getBytesSync(12);
        const cipher = forge.cipher.createCipher('AES-GCM', keyBytes);
        cipher.start({ iv: ivBytes });
        cipher.update(forge.util.createBuffer(plaintext, 'utf8'));
        const result = cipher.finish();
        if (!result) throw new Error("Falha ao finalizar criptografia AES-GCM no cliente.");

        return {
            encryptedData: forge.util.encode64(cipher.output.getBytes()),
            iv: forge.util.encode64(ivBytes),
            authTag: forge.util.encode64(cipher.mode.tag.getBytes())
        };
    } catch (error) {
        console.error("Erro durante a criptografia no cliente (cryptoService.js):", error);
        return null;
    }
}
