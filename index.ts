(typeof module == 'object' ? module.exports : window).compile = function compile(code: string): {success: boolean, code?: string} {
    var js: {code: string, stack: Record<string, number | number[]>} = {code: '_=0,$=0;', stack: {}};

    for(var i = 0; i < code.length; i++) {
        if(code[i] == '$') {
            var chunk: string = code.slice(i+1, i+4);
            if(!(/[a-z]{1}([a-f0-9]{2}|\[\])/.test(chunk) && chunk.length == 3)) {
                return {success: false};
            }
            if(chunk.slice(1,3) == '[]') {
                js.stack[chunk[0]] = [];
            } else {
                js.stack[chunk[0]] = parseInt(chunk.slice(1,3), 16);
            }
            i += 3;
        } else if(code[i] == '.') {
            var chunk = code.slice(i, i+2);
            if(!(/\.[a-z]{1}/.test(chunk) && chunk.length == 2)) {
                return {success: false};
            }
            js.code += '$=' + chunk[1] + ';'
            i++
        } else if(code[i] == '>') {
            js.code += '_++;'
        } else if(code[i] == '<') {
            js.code += '_--;'
        } else if(code[i] == '#') {
            var chunk = code.slice(i, i+3);
            if(/#[a-f0-9]{2}/.test(chunk)) {
                js.code += `$[_]=${parseInt(chunk.slice(1,3), 16).toString()};`;
                i += 2;
            } else if(/#[a-z]{1}/.test(chunk)) {
                js.code += `$[_]=${chunk[1]};`;
                i++;
            } else {
                return {success: false};
            }
        } else if('+-*/^'.indexOf(code[i]) != -1) {
            var chunk: string = code.slice(i+1, i+3).split('').filter(e=>'{}'.indexOf(e)==-1).join('');
            if(!(/[a-f0-9]{2}/.test(chunk))) {
                js.code += `$[_]${code[i]}=${chunk};`;
                i++;
            } else if(!(/[a-z]{1}/.test(chunk))) {
                return {success: false};
            } else {
                js.code += `$[_]${code[i]}=${parseInt(chunk.slice(1,3), 16).toString()};`
                i += 3;
            }
        } else if(/[a-z]:\{/.test(code.slice(i-1,i+2))) {
            js.code += `$=${code[i-1]};for(_=0;_<$.length;_++){`;
            i++
        } else if(code[i] == '}') {
            js.code += '}';
        }
    }
    js.code += 'return{$:!0';

    var stackKeys = Object.keys(js.stack);
    for(var i = 0; i < stackKeys.length; i++) {
        js.code = `${stackKeys[i]}=${JSON.stringify(js.stack[stackKeys[i]])},${js.code},${stackKeys[i]}:${stackKeys[i]}`;
    }
    return {success: true, code: `(function(){${js.code}}})()`};
}

