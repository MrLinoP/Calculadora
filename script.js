function appendToDisplay(value) {
    const display = document.getElementById('display');
    const currentDisplayValue = display.value;

    // Si el display muestra "Error", limpio el display
    if (currentDisplayValue === 'Error') {
        display.value = ''; 
    }
    //añado un 0 si el primer valor que se escribe es un operador o un punto
    if(currentDisplayValue === '' && (value==='*' || value==='-' || value==='/' || value==='+' || value==='.')){
        display.value = '0'; 
    }

    // Verifico si se está añadiendo un paréntesis
    if (value === '(' && currentDisplayValue) {
        //en caso el último valor del display es un dígito o un paréntesis de cierre, añado un * antes para que
        //se pueda interpretar 8(2) como 8*(2) por ejemplo
        if (/\d$/.test(currentDisplayValue) || currentDisplayValue.endsWith(')')) {
            display.value += '*(';
        } else {
            display.value += '(';
        }
    } else if (value === '.') {
        // Permito el punto decimal solo si no hay otro punto en el último número
        const lastNumber = currentDisplayValue.split(/[\+\-\*\/\(\)]/).pop();
        if (!lastNumber.includes('.')) {
            display.value += value; 
        }
    } else if (['+', '-', '*', '/'].includes(value) && currentDisplayValue) {
        //si el valor del display actual termina en un opeardor y se ingresa otro operador,
        //este último reemplaza al anterior
        if (['+', '-', '*', '/'].includes(currentDisplayValue[currentDisplayValue.length - 1])) {
            display.value = currentDisplayValue.slice(0, -1) + value;
        } else {
            display.value += value;
        }
    } else {
        display.value += value;
    }
}

// Función para manejar la entrada del teclado
document.addEventListener('keydown', function(event) {
    const key = event.key;

    // Mapeo de teclas a valores
    const keyMap = {
        '0': '0',
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '6': '6',
        '7': '7',
        '8': '8',
        '9': '9',
        '+': '+',
        '-': '-',
        '*': '*',
        '/': '/',
        'Enter': 'Enter',
        'Backspace': 'Backspace',
        '(': '(',
        ')': ')',
        '.': '.'
    };

    // verifico si la tecla está mapeada para confirmar que es válido
    if (keyMap[key]) {
        // evito el comportamiento predeterminado para asegurarme que las 
        //teclas que se ingresan se comporten de la manera que yo quiero
        event.preventDefault(); 
        const display = document.getElementById('display');
        if (key === 'Enter') {
            calculateResult(); 
        } else if (key === 'Backspace') {
            deleteLastDigit(); 
        } else {
            appendToDisplay(keyMap[key]); 
        }
    }
});

function deleteLastDigit() {
    const display = document.getElementById('display');
    const currentDisplayValue = display.value;
    if (currentDisplayValue === 'Error') {
        display.value = ''; // si el mensaje actual es 'Error', se tiene que borrar 
    }else{
        display.value = display.value.slice(0, -1); // elimino el último carácter
    }
}

function clearDisplay() {
    const display = document.getElementById('display');
    display.value = ''; 
}

function calculateResult() {
    const display = document.getElementById('display');
    try {
        //solo se realiza el cálculo si hay un operador en el display
        if (!(/[*/+-]/.test(display.value)))
            return;
        
        // evaluo la expresión
        var result = evaluateExpression(display.value);
        
        //valido que sea un valor coherente, sino se pone un mensaje de 'Error'
        if (Math.abs(result) === Infinity || isNaN(result)) {
            display.value = 'Error';
        } else {
            result = Math.round(result * 1e10) / 1e10; //redondeo para manejar los valores que genera el tipo double
            //añado el valor al historial dado que es un recultado coherente
            addToHistory(display.value, result);
            display.value = result; // actualizo el display
        }
    } catch (error) {
        display.value = 'Error';
    }
}


function evaluateExpression(expression) {
    return parseExpression(Array.from(expression), 0).result;
}

function parseExpression(s, idx) {
    const stack = []; // pila para almacenar resultados parciales
    let num = 0; // guardo el valor actual que se está analizando
    let sign = '+'; // último operador encontrado, por defecto +
    let i = idx; // indice en la cadena

    while (i < s.length) {
        const c = s[i];

        //si es carácter actual es un número, se coloca al final
        if (c >= '0' && c <= '9') {
            num = (num * 10) + Number(c);
        //proceso la parte decimal
        } else if (c === '.') {
            let decimalPlace = 0.1; // variable para la parte decimal
            //mientras halla números después del punto, se acumulan
            while (i + 1 < s.length && s[i + 1] >= '0' && s[i + 1] <= '9') {
                i++;
                num += Number(s[i]) * decimalPlace;
                decimalPlace *= 0.1;
            }
        } else if (c === '(') { //si el caracter es un parentesis, entonces se llama recursivamente para hallar el nuevo número parcial
            const subResult = parseExpression(s, i + 1);
            num = subResult.result; //asignamos el número parcial hallado
            i = subResult.index; //también se tiene que adelantar el índice
        }
        //si se encuentra un opearador o estamos en el final de la expresión,
        //entonces se aplica el operador previo
        if (['+', '-', '*', '/', ')'].includes(c) || i === s.length - 1) {
            if (sign === '+') stack.push(num); 
            else if (sign === '-') stack.push(-num);
            else if (sign === '*') stack.push(stack.pop() * num);
            else if (sign === '/') stack.push(stack.pop() / num);

            sign = c; //se asigna el operador que se acaba de hallar
            num = 0; //dado que el número ya lo procesamos, se reinicia la variable para resultados parciales


            //cuando se encuentra el paréntesis de cerrada, se retorna el resultado acumulado y su índice
            if (c === ')') {
                return { result: stack.reduce((a, b) => a + b, 0), index: i };
            }
        }

        i++;
    }

    return { result: stack.reduce((a, b) => a + b, 0), index: i };
}



function addToHistory(expression, result) {
    const historyDiv = document.getElementById('history');
    
    // creo un nuevo elemento para el historial
    const entry = document.createElement('div');
    entry.classList.add('history-entry'); // le asigno la clase para el estilo
    entry.textContent = `${expression} = ${result}`; // le asigno el texto
    
    // añado el nuevo elemento al historial
    historyDiv.appendChild(entry);
}
