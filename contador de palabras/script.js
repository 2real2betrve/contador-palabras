// WordCount Pro - Lógica Principal

document.addEventListener('DOMContentLoaded', () => {
    // Referencias DOM principales
    const editor = document.getElementById('main-editor');
    const liveCharCounter = document.getElementById('live-char-counter');
    
    // Configuración Sidebar
    const setReadSpeed = document.getElementById('set-read-speed');
    const valReadSpeed = document.getElementById('val-read-speed');
    const setSpeakSpeed = document.getElementById('set-speak-speed');
    const valSpeakSpeed = document.getElementById('val-speak-speed');
    const setWordsPage = document.getElementById('set-words-page');
    const setLanguage = document.getElementById('set-language');
    
    // Stopwords ES
    const stopWordsES = new Set(['el','la','los','las','un','una','unos','unas','y','e','ni','que','o','u','pero','aunque','mas','sino','a','ante','bajo','cabe','con','contra','de','desde','durante','en','entre','hacia','hasta','mediante','para','por','según','sin','so','sobre','tras','versos','vía','me','te','se','nos','os','le','les','lo','los','mi','tu','su','mis','tus','sus','del','al','es','son','ser','está','están','fue','fueron','como','si','no','ya','muy','más','qué','quién','cuándo','dónde','cómo','porque','este','esta','estos','estas','ese','esa','esos','esas','aquel','aquella','aquellos','aquellas']);
    
    // Stopwords EN
    const stopWordsEN = new Set(['the','a','an','and','or','but','if','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','can','will','just','don','should','now','i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing']);

    // Cache de valores anteriores para animar
    let prevStats = {
        words: 0, chars: 0, charsNoSpaces: 0, sentences: 0, 
        paragraphs: 0, lines: 0, pages: 0, uniqueWords: 0
    };

    // --- UTILIDADES ---

    // Debounce
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Animación de números
    function animateValue(obj, start, end, duration) {
        if (start === end) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Easing easeOutQuart
            const ease = 1 - Math.pow(1 - progress, 4);
            const current = (progress === 1) ? end : start + (end - start) * ease;
            
            // Si es decimal (páginas), formato. Si no, entero.
            if (Number.isInteger(end)) {
                obj.innerText = Math.floor(current).toLocaleString('es-ES');
            } else {
                obj.innerText = current.toFixed(1);
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function updateStatAnimated(id, newValue, key) {
        const el = document.getElementById(id);
        if (!el) return;
        animateValue(el, prevStats[key], newValue, 400);
        prevStats[key] = newValue;
    }

    // --- MOTOR DE PROCESAMIENTO ---

    function analyzeText() {
        const text = editor.value;
        const textTrimmed = text.trim();
        
        // Básicas
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s+/g, '').length;
        
        // Regex para palabras en español (incluye tildes, ñ)
        const wordMatch = textTrimmed.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+/g);
        const words = wordMatch ? wordMatch.length : 0;
        
        // Oraciones (terminadas en . ! ?)
        const sentencesMatch = textTrimmed.match(/[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/g);
        const sentences = sentencesMatch ? sentencesMatch.length : 0;
        
        // Párrafos (separados por al menos un \n)
        const paragraphs = textTrimmed ? textTrimmed.split(/\n+/).filter(p => p.trim().length > 0).length : 0;
        
        // Líneas físicas (incluye vacías)
        const lines = text.length === 0 ? 0 : text.split('\n').length;

        // Páginas
        const wpp = parseInt(setWordsPage.value) || 300;
        const pages = words > 0 ? (words / wpp) : 0;

        // Tiempos
        const readWpm = parseInt(setReadSpeed.value) || 250;
        const speakWpm = parseInt(setSpeakSpeed.value) || 150;
        
        const readMins = words / readWpm;
        const speakMins = words / speakWpm;

        function formatTime(minutes) {
            const mins = Math.floor(minutes);
            const secs = Math.round((minutes - mins) * 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        // Actualizar UI Principales
        updateStatAnimated('stat-words', words, 'words');
        updateStatAnimated('stat-chars', chars, 'chars');
        updateStatAnimated('stat-chars-no-spaces', charsNoSpaces, 'charsNoSpaces');
        updateStatAnimated('stat-sentences', sentences, 'sentences');
        updateStatAnimated('stat-paragraphs', paragraphs, 'paragraphs');
        updateStatAnimated('stat-lines', lines, 'lines');
        updateStatAnimated('stat-pages', pages, 'pages');
        
        document.getElementById('stat-read-time').innerText = formatTime(readMins);
        document.getElementById('stat-speak-time').innerText = formatTime(speakMins);
        
        // Live counter en textarea
        liveCharCounter.innerText = chars.toLocaleString('es-ES');
        document.getElementById('toolbar-words').innerText = words.toLocaleString('es-ES');
        document.getElementById('toolbar-chars').innerText = chars.toLocaleString('es-ES');

        checkLimits(chars, words);
    }

    // Análisis Profundo (Debounced más tiempo por rendimiento)
    function deepAnalyzeText() {
        const text = editor.value;
        const wordMatch = text.toLowerCase().match(/[a-zA-Záéíóúñü]+/g) || [];
        const words = wordMatch.length;
        
        if (words === 0) {
            resetDeepAnalysis();
            return;
        }

        // Frecuencia y Únicas
        const wordFreq = {};
        let uniqueCount = 0;
        const useStopwords = document.getElementById('toggle-stopwords').checked;
        const currentLanguage = setLanguage.value;
        const activeStopWords = currentLanguage === 'es' ? stopWordsES : stopWordsEN;

        wordMatch.forEach(w => {
            if (useStopwords && activeStopWords.has(w)) return;
            if (!wordFreq[w]) {
                wordFreq[w] = 0;
                uniqueCount++;
            }
            wordFreq[w]++;
        });

        const uniqueDensity = words > 0 ? ((uniqueCount / words) * 100).toFixed(1) : 0;
        
        updateStatAnimated('stat-unique-words', uniqueCount, 'uniqueWords');
        document.getElementById('stat-unique-density').innerText = `${uniqueDensity}%`;

        // Top Words
        const sortedWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);
        const topWord = sortedWords.length > 0 ? sortedWords[0][0] : '-';
        document.getElementById('stat-top-word').innerText = topWord;

        renderTopWords(sortedWords.slice(0, 10), words);
        
        // Longitudes
        let wordLengths = { '1-3': 0, '4-6': 0, '7-9': 0, '10+': 0 };
        let totalCharsInWords = 0;
        
        wordMatch.forEach(w => {
            const len = w.length;
            totalCharsInWords += len;
            if (len <= 3) wordLengths['1-3']++;
            else if (len <= 6) wordLengths['4-6']++;
            else if (len <= 9) wordLengths['7-9']++;
            else wordLengths['10+']++;
        });

        renderLengthChart(wordLengths, words);

        // Legibilidad (Flesch-Kincaid)
        const sentencesMatch = text.match(/[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/g);
        const sentences = sentencesMatch ? sentencesMatch.length : 1;
        
        const paragraphs = text.trim() ? text.trim().split(/\n+/).filter(p => p.trim().length > 0).length : 1;
        
        // Cálculo simplificado de sílabas para español (aproximación rápida)
        const syllables = text.toLowerCase().match(/[aeiouáéíóúü]+/g);
        const syllableCount = syllables ? syllables.length : 1;

        const avgWordLen = (totalCharsInWords / words).toFixed(1);
        const avgSentenceLen = (words / sentences).toFixed(1);
        const avgParagraphLen = (sentences / paragraphs).toFixed(1);
        
        let readability = 0;
        if (currentLanguage === 'es') {
            // Fórmula Fernández Huerta (Flesch para español)
            readability = 206.84 - (60 * (syllableCount / words)) - (1.02 * (words / sentences));
        } else {
            // Standard Flesch-Kincaid Reading Ease
            readability = 206.835 - (1.015 * (words / sentences)) - (84.6 * (syllableCount / words));
        }
        
        readability = Math.max(0, Math.min(100, readability)); // Clampear 0-100

        document.getElementById('avg-word-len').innerText = avgWordLen;
        document.getElementById('avg-sentence-len').innerText = avgSentenceLen;
        document.getElementById('avg-paragraph-len').innerText = avgParagraphLen;
        document.getElementById('read-flesch').innerText = readability.toFixed(1);

        const badge = document.getElementById('read-badge');
        const level = document.getElementById('read-level');
        
        if (readability > 80) {
            badge.className = 'badge easy'; badge.innerText = 'Muy Fácil'; level.innerText = 'Básico (Primaria)';
        } else if (readability > 60) {
            badge.className = 'badge easy'; badge.innerText = 'Fácil'; level.innerText = 'Básico (Secundaria)';
        } else if (readability > 50) {
            badge.className = 'badge medium'; badge.innerText = 'Normal'; level.innerText = 'Intermedio';
        } else if (readability > 30) {
            badge.className = 'badge hard'; badge.innerText = 'Difícil'; level.innerText = 'Avanzado (Universitario)';
        } else {
            badge.className = 'badge hard'; badge.innerText = 'Muy Difícil'; level.innerText = 'Académico / Técnico';
        }

        checkKeywordDensity();
    }

    function resetDeepAnalysis() {
        document.getElementById('word-freq-list').innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">Escribe algo para analizar frecuencias.</p>';
        document.getElementById('length-chart-container').innerHTML = '';
        ['avg-word-len', 'avg-sentence-len', 'avg-paragraph-len', 'read-flesch'].forEach(id => document.getElementById(id).innerText = '0');
        document.getElementById('read-level').innerText = 'N/A';
        document.getElementById('read-badge').className = 'badge';
        document.getElementById('read-badge').innerText = 'N/A';
    }

    function renderTopWords(topWords, totalWords) {
        const container = document.getElementById('word-freq-list');
        container.innerHTML = '';
        
        if (topWords.length === 0) return;
        
        const maxCount = topWords[0][1];

        topWords.forEach(([word, count]) => {
            const percent = ((count / totalWords) * 100).toFixed(1);
            const barWidth = (count / maxCount) * 100;
            
            const div = document.createElement('div');
            div.className = 'word-freq-item';
            div.innerHTML = `
                <div class="word-freq-word" title="${word}">${word}</div>
                <div class="word-freq-bar-container">
                    <div class="word-freq-bar" style="width: ${barWidth}%"></div>
                </div>
                <div class="word-freq-count">${count} <span style="font-size:0.75rem; color:var(--text-muted)">(${percent}%)</span></div>
            `;
            container.appendChild(div);
        });
    }

    function renderLengthChart(data, totalWords) {
        const container = document.getElementById('length-chart-container');
        container.innerHTML = '';
        
        const labels = Object.keys(data);
        const max = Math.max(...Object.values(data), 1); // Evitar división por 0

        labels.forEach(label => {
            const count = data[label];
            const height = (count / max) * 100;
            const percent = ((count / totalWords) * 100).toFixed(1);
            
            const wrapper = document.createElement('div');
            wrapper.className = 'chart-bar-wrapper';
            wrapper.title = `${label} letras: ${count} (${percent}%)`;
            
            wrapper.innerHTML = `
                <div class="chart-bar" style="height: ${height > 0 ? height : 2}%"></div>
                <div class="chart-label">${label}</div>
            `;
            container.appendChild(wrapper);
        });
    }

    // --- LIMITES ---
    const limitType = document.getElementById('limit-type');
    const limitValue = document.getElementById('limit-value');
    const limitContainer = document.getElementById('limit-progress-container');
    const limitBar = document.getElementById('limit-progress-bar');
    const limitText = document.getElementById('limit-progress-text');

    function checkLimits(chars, words) {
        const type = limitType.value;
        if (type === 'none') {
            limitContainer.classList.add('hidden');
            liveCharCounter.classList.remove('limit-exceeded');
            return;
        }

        const max = parseInt(limitValue.value);
        if (!max || isNaN(max)) return;

        limitContainer.classList.remove('hidden');
        
        const current = type === 'chars' ? chars : words;
        const percent = Math.min((current / max) * 100, 100);
        
        limitBar.style.width = `${percent}%`;
        limitText.innerText = `${percent.toFixed(0)}%`;

        limitBar.className = 'progress-bar';
        if (percent > 85 && percent <= 100) {
            limitBar.classList.add('warning');
        } else if (percent >= 100 || current > max) {
            limitBar.classList.add('danger');
            liveCharCounter.classList.add('limit-exceeded');
        } else {
            liveCharCounter.classList.remove('limit-exceeded');
        }
    }

    limitType.addEventListener('change', () => {
        if (limitType.value === 'none') {
            limitValue.classList.add('hidden');
            limitContainer.classList.add('hidden');
        } else {
            limitValue.classList.remove('hidden');
            analyzeText();
        }
    });

    limitValue.addEventListener('input', analyzeText);

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            limitType.value = btn.dataset.type;
            limitValue.value = btn.dataset.val;
            limitValue.classList.remove('hidden');
            analyzeText();
            editor.focus();
        });
    });

    // --- SEO KEYWORD ---
    const seoKeyword = document.getElementById('seo-keyword');
    const checkKeywordDensity = debounce(() => {
        const keyword = seoKeyword.value.trim().toLowerCase();
        if (!keyword) {
            document.getElementById('seo-count').innerText = '0';
            document.getElementById('seo-density-val').innerText = '0%';
            return;
        }
        
        const text = editor.value.toLowerCase();
        // Regex para buscar palabra exacta o frase completa
        const regex = new RegExp('\\b' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
        const matches = text.match(regex);
        const count = matches ? matches.length : 0;
        
        const wordMatch = text.match(/[a-záéíóúñü]+/g) || [];
        const words = wordMatch.length;
        
        // Ojo, si la keyword tiene varias palabras, hay que ajustar la densidad según palabras totales.
        // Aproximamos usando la métrica general de "ocurrencias sobre total de palabras".
        const density = words > 0 ? ((count / words) * 100).toFixed(2) : 0;
        
        document.getElementById('seo-count').innerText = count;
        const densityEl = document.getElementById('seo-density-val');
        densityEl.innerText = `${density}%`;
        
        if (density > 0 && density <= 3) densityEl.style.color = 'var(--success-color)';
        else if (density > 3) densityEl.style.color = 'var(--danger-color)';
        else densityEl.style.color = 'var(--text-primary)';
        
        const firstPos = matches ? text.indexOf(keyword) : -1;
        document.getElementById('seo-first-pos').innerText = firstPos >= 0 ? `Carácter ${firstPos}` : '-';
        
    }, 300);

    seoKeyword.addEventListener('input', checkKeywordDensity);


    // --- EVENT LISTENERS PRINCIPALES ---
    const debouncedAnalyze = debounce(() => {
        analyzeText();
        deepAnalyzeText();
    }, 100);

    editor.addEventListener('input', debouncedAnalyze);
    
    // Configuraciones de Sidebar
    setReadSpeed.addEventListener('input', (e) => {
        valReadSpeed.innerText = e.target.value;
        analyzeText();
    });
    setSpeakSpeed.addEventListener('input', (e) => {
        valSpeakSpeed.innerText = e.target.value;
        analyzeText();
    });
    setWordsPage.addEventListener('change', analyzeText);
    setLanguage.addEventListener('change', deepAnalyzeText);
    document.getElementById('toggle-stopwords').addEventListener('change', deepAnalyzeText);

    // Toggles de visibilidad de paneles
    document.getElementById('toggle-analysis-sec').addEventListener('change', (e) => {
        document.getElementById('analisis').classList.toggle('hidden', !e.target.checked);
    });
    document.getElementById('toggle-tools-sec').addEventListener('change', (e) => {
        document.getElementById('herramientas').classList.toggle('hidden', !e.target.checked);
    });
    document.getElementById('toggle-seo-sec').addEventListener('change', (e) => {
        document.querySelector('.seo-content').classList.toggle('hidden', !e.target.checked);
    });

    // Copiar Top Palabras
    const getTopWordsData = () => {
        const items = document.querySelectorAll('.word-freq-item');
        const data = [];
        items.forEach(item => {
            const word = item.querySelector('.word-freq-word').innerText;
            const countStr = item.querySelector('.word-freq-count').innerText;
            const count = parseInt(countStr.split(' ')[0]);
            data.push({ word, count });
        });
        return data;
    };

    document.getElementById('copy-top-json').addEventListener('click', async () => {
        const data = getTopWordsData();
        if (data.length === 0) return;
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        const btn = document.getElementById('copy-top-json');
        btn.innerText = 'Copiado';
        setTimeout(() => btn.innerText = 'JSON', 2000);
    });

    document.getElementById('copy-top-csv').addEventListener('click', async () => {
        const data = getTopWordsData();
        if (data.length === 0) return;
        let csv = "Palabra,Apariciones\n";
        data.forEach(d => csv += `"${d.word}",${d.count}\n`);
        await navigator.clipboard.writeText(csv);
        const btn = document.getElementById('copy-top-csv');
        btn.innerText = 'Copiado';
        setTimeout(() => btn.innerText = 'CSV', 2000);
    });


    // --- HERRAMIENTAS TOOLBAR ---
    document.getElementById('btn-clear').addEventListener('click', () => {
        editor.value = '';
        debouncedAnalyze();
    });

    document.getElementById('btn-copy').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(editor.value);
            const btn = document.getElementById('btn-copy');
            btn.innerText = '✅ Copiado';
            setTimeout(() => btn.innerText = '✂️ Copiar', 2000);
        } catch (err) {
            alert('Error al copiar el texto');
        }
    });

    document.getElementById('btn-paste').addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            editor.value += text;
            debouncedAnalyze();
        } catch (err) {
            alert('Permiso denegado o error al pegar');
        }
    });

    document.getElementById('btn-download').addEventListener('click', () => {
        if (!editor.value) return;
        const blob = new Blob([editor.value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'WordCountPro_Texto.txt';
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('btn-fullscreen').addEventListener('click', () => {
        const section = document.querySelector('.editor-section');
        if (!document.fullscreenElement) {
            section.requestFullscreen().catch(err => {
                alert(`Error al activar pantalla completa: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // DRAG & DROP de Archivos (.txt)
    const dropZone = document.getElementById('drop-zone');
    const fileUpload = document.getElementById('file-upload');

    function handleFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            editor.value = e.target.result;
            debouncedAnalyze();
        };
        reader.readAsText(file);
    }

    fileUpload.addEventListener('change', (e) => handleFile(e.target.files[0]));

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });


    // --- TABS Y ACORDEONES ---
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Quitar active de todos
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Activar actual
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isActive = header.classList.contains('active');
            
            // Cerrar todos
            document.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('active'));
            document.querySelectorAll('.accordion-content').forEach(c => c.style.maxHeight = null);
            
            // Abrir si no estaba activo
            if (!isActive) {
                header.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });


    // --- TABS HERRAMIENTAS LOGICA ---
    
    // Comparador
    const compA = document.getElementById('compare-a');
    const compB = document.getElementById('compare-b');
    const compRes = document.getElementById('compare-results');
    const compMiss = document.getElementById('compare-missing');
    
    const doCompare = () => {
        const wordsAMatch = compA.value.match(/\b\w+\b/g) || [];
        const wordsBMatch = compB.value.match(/\b\w+\b/g) || [];
        
        const wa = wordsAMatch.length;
        const wb = wordsBMatch.length;
        const diff = Math.abs(wa - wb);
        const charsDiff = Math.abs(compA.value.length - compB.value.length);
        
        compRes.innerHTML = `
            <strong>Diferencias Generales:</strong><br>
            Palabras: ${diff} (${wa} vs ${wb})<br>
            Caracteres: ${charsDiff} (${compA.value.length} vs ${compB.value.length})
        `;
        
        // Basic Diff: Words in A but not in B
        const setB = new Set(wordsBMatch.map(w => w.toLowerCase()));
        const missingInB = [...new Set(wordsAMatch.map(w => w.toLowerCase()).filter(w => !setB.has(w)))];
        
        if (missingInB.length > 0) {
            compMiss.innerHTML = `<strong>Palabras en Original pero no en Modificado (Max 10):</strong><br>` + missingInB.slice(0, 10).join(', ') + (missingInB.length > 10 ? '...' : '');
        } else {
            compMiss.innerHTML = '';
        }
    };
    compA.addEventListener('input', doCompare);
    compB.addEventListener('input', doCompare);

    // Lorem Ipsum
    document.getElementById('btn-generate-lorem').addEventListener('click', () => {
        const count = parseInt(document.getElementById('lorem-count').value) || 5;
        const type = document.getElementById('lorem-type').value;
        const lang = document.getElementById('lorem-lang').value;
        
        let text = "";
        if (lang === 'classic') {
            text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
        } else if (lang === 'es') {
            text = "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor. Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda. El resto della concluían sayo de velarte, calzas de velludo para las fiestas con sus pantuflos de lo mismo.";
        } else {
            text = Array.from({length: 100}, (_, i) => Math.floor(Math.random() * 10000).toString()).join(" ");
        }
        
        let result = "";
        if (type === 'paragraphs') {
            for(let i=0; i<count; i++) result += text + "\n\n";
        } else if (type === 'sentences') {
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            let added = 0;
            while(added < count) {
                result += sentences[added % sentences.length] + " ";
                added++;
            }
        } else {
            const words = text.split(/\s+/);
            let added = 0;
            while(added < count) {
                result += words[added % words.length] + " ";
                added++;
            }
        }
        
        editor.value = result.trim();
        debouncedAnalyze();
    });

    // Convertidores
    const modifyEditorText = (modifierFunc) => {
        if (!editor.value) return;
        editor.value = modifierFunc(editor.value);
        debouncedAnalyze();
    };

    document.getElementById('btn-char-search').addEventListener('click', () => {
        const char = document.getElementById('char-search-input').value;
        if (!char || !editor.value) {
            document.getElementById('char-search-result').innerText = '0';
            return;
        }
        // Escapar caracteres regex especiales y buscar
        const regex = new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = editor.value.match(regex);
        document.getElementById('char-search-result').innerText = matches ? matches.length : 0;
    });

    document.getElementById('conv-upper').addEventListener('click', () => modifyEditorText(t => t.toUpperCase()));
    document.getElementById('conv-lower').addEventListener('click', () => modifyEditorText(t => t.toLowerCase()));
    document.getElementById('conv-title').addEventListener('click', () => modifyEditorText(t => {
        return t.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
    }));
    document.getElementById('conv-sentence').addEventListener('click', () => modifyEditorText(t => {
        return t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
    }));
    document.getElementById('conv-rm-dupes').addEventListener('click', () => modifyEditorText(t => {
        const lines = t.split('\n');
        return [...new Set(lines)].join('\n');
    }));
    document.getElementById('conv-rm-empty').addEventListener('click', () => modifyEditorText(t => {
        return t.split('\n').filter(line => line.trim() !== '').join('\n');
    }));
    document.getElementById('conv-rm-spaces').addEventListener('click', () => modifyEditorText(t => {
        return t.replace(/[ \t]{2,}/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();
    }));
    document.getElementById('conv-reverse').addEventListener('click', () => modifyEditorText(t => {
        return t.split('').reverse().join('');
    }));
    document.getElementById('conv-alternate').addEventListener('click', () => modifyEditorText(t => {
        return t.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
    }));
    document.getElementById('conv-encode-url').addEventListener('click', () => modifyEditorText(t => encodeURIComponent(t)));
    document.getElementById('conv-encode-html').addEventListener('click', () => modifyEditorText(t => {
        const el = document.createElement('div');
        el.innerText = t;
        return el.innerHTML;
    }));
    
    const extractToEditorOrAlert = (regex, notFoundMsg) => {
        if (!editor.value) return;
        const matches = editor.value.match(regex);
        if (matches && matches.length > 0) {
            editor.value = matches.join('\n');
            debouncedAnalyze();
        } else {
            alert(notFoundMsg);
        }
    };

    document.getElementById('conv-extract-emails').addEventListener('click', () => {
        extractToEditorOrAlert(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, 'No se encontraron emails.');
    });
    document.getElementById('conv-extract-urls').addEventListener('click', () => {
        extractToEditorOrAlert(/(https?:\/\/[^\s]+)/gi, 'No se encontraron URLs.');
    });
    document.getElementById('conv-extract-nums').addEventListener('click', () => {
        extractToEditorOrAlert(/\b\d+\b/g, 'No se encontraron números aislados.');
    });

    // Exportar (Simulados los más complejos)
    document.getElementById('exp-pdf').addEventListener('click', () => {
        window.print();
    });
    
    document.getElementById('exp-csv').addEventListener('click', () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Metrica,Valor\n"
            + `Palabras,${prevStats.words}\n`
            + `Caracteres,${prevStats.chars}\n`
            + `Sin Espacios,${prevStats.charsNoSpaces}\n`
            + `Oraciones,${prevStats.sentences}\n`
            + `Parrafos,${prevStats.paragraphs}\n`
            + `Tiempo Lectura (min),${(prevStats.words / parseInt(setReadSpeed.value || 250)).toFixed(2)}`;
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "WordCountPro_Stats.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    document.getElementById('exp-json').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prevStats, null, 2));
        const link = document.createElement('a');
        link.setAttribute("href", dataStr);
        link.setAttribute("download", "WordCountPro_Stats.json");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    document.getElementById('exp-md').addEventListener('click', async () => {
        const mdText = `## Estadísticas de WordCount Pro\n` + 
            `- **Palabras:** ${prevStats.words}\n` + 
            `- **Caracteres:** ${prevStats.chars}\n` + 
            `- **Caracteres sin exp.:** ${prevStats.charsNoSpaces}\n` + 
            `- **Oraciones:** ${prevStats.sentences}\n` + 
            `- **Párrafos:** ${prevStats.paragraphs}\n` + 
            `- **Páginas Estimadas:** ${prevStats.pages.toFixed(1)}\n` + 
            `- **Palabras Únicas:** ${prevStats.uniqueWords}\n`;
        try {
            await navigator.clipboard.writeText(mdText);
            const btn = document.getElementById('exp-md');
            btn.innerText = '✅ Copiado MD';
            setTimeout(() => btn.innerText = '📝 Copiar Stats (MD)', 2000);
        } catch(e) {
            alert('Error al copiar el markdown');
        }
    });

    document.getElementById('exp-share').addEventListener('click', async () => {
        const shareData = {
            title: 'Mis Estadísticas de WordCount Pro',
            text: `He escrito ${prevStats.words} palabras y ${prevStats.chars} caracteres. ¡Analiza tu texto gratis!`,
            url: window.location.href
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) {}
        } else {
            alert('La API de Web Share no está soportada en tu navegador.');
        }
    });

    // --- INTERSECTION OBSERVER PARA ANIMACIONES DE SCROLL ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Dejar de observar una vez que ha aparecido (opcional, para animar solo una vez)
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section').forEach(section => {
        observer.observe(section);
    });

    // INIT
    resetDeepAnalysis();
});
