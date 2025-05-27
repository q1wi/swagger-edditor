// js/file-yaml.js
function setupFileInputListener() {
    const fileInput = el('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        const newDoc = jsyaml.load(event.target.result);
                        resetAndLoadSwaggerDoc(newDoc); // resetAndLoadSwaggerDoc from main.js
                        alert('YAML file loaded successfully!');
                    } catch (err) {
                        alert('Error loading file: ' + err.message);
                    }
                };
                reader.readAsText(file);
                e.target.value = null;
            }
        });
    }
}

function exportYAML() {
    try {
        const yaml = jsyaml.dump(swaggerDoc, { skipInvalid: true });
        const blob = new Blob([yaml], { type: 'text/yaml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = create('a', { href: url, download: 'swagger.yaml' });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Error exporting YAML:", e);
        alert("Error exporting YAML: " + e.message);
    }
}

function showPreview() {
    try {
        el('yamlPreview').textContent = jsyaml.dump(swaggerDoc, { skipInvalid: true });
        el('previewModal').style.display = 'block';
    } catch (e) {
        console.error("Error previewing YAML:", e);
        alert("Error previewing YAML: " + e.message);
    }
}

function closePreview() {
    el('previewModal').style.display = 'none';
}

function copyYAMLToClipboard(buttonElement) {
    try {
        const yaml = jsyaml.dump(swaggerDoc, { skipInvalid: true });
        navigator.clipboard.writeText(yaml).then(() => {
            // Show a temporary success message
            const originalText = buttonElement.textContent;
            buttonElement.textContent = '✓ Copied!';
            buttonElement.style.backgroundColor = '#27ae60';
            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.style.backgroundColor = '';
            }, 2000);
        }).catch(err => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = yaml;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            // Show success message
            const originalText = buttonElement.textContent;
            buttonElement.textContent = '✓ Copied!';
            buttonElement.style.backgroundColor = '#27ae60';
            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.style.backgroundColor = '';
            }, 2000);
        });
    } catch (e) {
        console.error("Error copying YAML to clipboard:", e);
        alert("Error copying YAML to clipboard: " + e.message);
    }
}
