var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//get the currently selected text node + range
const selectedText = figma.currentPage.selectedTextRange;
let pluginData = populatePluginData();
//track which command run by the user
const command = figma.command === 'remove' ? 'remove' : 'add';
//count how many characters were replaced
let countChanged = 0;
let countSkipped = 0;
//text ranges to change
const textToChange = [];
//conditions (these are all the characters that will be replaceable by the plugin)
const characters = [
    '™', '℠', '®', '§', '†', '*', '¤', '¶', '©',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'
];
const numbers = '0123456789';
const superscript = '⁰¹²³⁴⁵⁶⁷⁸⁹';
//character mappings for numbers
//const charMap.find(char.ss ===)
const charMap = [
    { 'number': 0, 'ss': '⁰' },
    { 'number': 1, 'ss': '¹' },
    { 'number': 2, 'ss': '²' },
    { 'number': 3, 'ss': '³' },
    { 'number': 4, 'ss': '⁴' },
    { 'number': 5, 'ss': '⁵' },
    { 'number': 6, 'ss': '⁶' },
    { 'number': 7, 'ss': '⁷' },
    { 'number': 8, 'ss': '⁸' },
    { 'number': 9, 'ss': '⁹' }
];
//check for selected text range
//if no text is selected, close the plugin and tell the user
if (selectedText) {
    let textNode = selectedText.node;
    //loop through each character in the selected range and log characters that can be replaced
    for (let i = selectedText.start; i < selectedText.end; i++) {
        if (characters.includes(textNode.characters[i])) {
            let character = { node: textNode, index: i };
            //push an object that contains the text node, and the character index into an array
            textToChange.push(character);
        }
    }
}
else {
    if (command === 'add') {
        figma.closePlugin('There is no selected text to superscript.');
    }
    else if (command === 'remove') {
        figma.closePlugin('There is no selected text to remove superscript.');
    }
}
//if there is text to change in the array
//determine which function to run to add or remove superscript
if (textToChange.length > 0) {
    switch (command) {
        case 'add':
            addSuperscript(textToChange);
            break;
        case 'remove':
            removeSuperscript(textToChange);
            break;
    }
}
else {
    if (command === 'add') {
        figma.closePlugin('The selected characters cannot be superscripted.');
    }
    else if (command === 'remove') {
        figma.closePlugin('There are no (supported) superscript characters to remove.');
    }
}
//function to remove superscript characters
function removeSuperscript(nodes) {
    //iterate through all text nodes
    //import fonts and apply to selection
    //this has to be async in order for me to await the results on each iteration to load fonts
    nodes.forEach((node) => __awaiter(this, void 0, void 0, function* () {
        let textNode = node.node;
        //properties of the existing text
        //need this to load the font for the existing text before we can change it
        let currentFont = textNode.getRangeFontName(node.index, node.index + 1);
        //determine weight for super script
        //the font we use only has 3 weights so this will determine the best weight to use
        let weight = determineWeight(currentFont.style);
        //properties of super script text
        let superScriptFont = {
            'family': 'EvokeSuperScript',
            'style': weight
        };
        let newFont = determineFont(textNode, node.index, currentFont);
        if (newFont) {
            try {
                //import super script + existing font
                yield figma.loadFontAsync(currentFont);
                yield figma.loadFontAsync(superScriptFont);
                yield figma.loadFontAsync(newFont);
                //replace superscript with numbers
                if (superscript.includes(textNode.characters[node.index])) {
                    let newChar = numberSuperscript(textNode.characters[node.index]);
                    textNode.deleteCharacters(node.index, node.index + 1);
                    textNode.insertCharacters(node.index, newChar, 'AFTER');
                }
                //apply font to range
                textNode.setRangeFontName(node.index, node.index + 1, newFont);
                //increase count
                countChanged++;
            }
            catch (err) {
                console.log(err);
                figma.notify('There was an issue loading a particular font.');
                countSkipped++;
            }
        }
        else {
            figma.notify('The old font was unable to be identified to remove superscripting.');
            countSkipped++;
        }
        waitToClose();
    }));
}
//function to add superscript characters
function addSuperscript(nodes) {
    //iterate through all text nodes
    //import fonts and apply to selection
    //this has to be async in order for me to await the results on each iteration to load fonts
    nodes.forEach((node) => __awaiter(this, void 0, void 0, function* () {
        let textNode = node.node;
        //properties of the existing text
        //need this to load the font for the existing text before we can change it
        let currentFont = textNode.getRangeFontName(node.index, node.index + 1);
        let beforeFont, afterFont;
        if (node.index > 0) {
            beforeFont = textNode.getRangeFontName(node.index - 1, node.index);
        }
        if (node.index != textNode.characters.length - 1) {
            afterFont = textNode.getRangeFontName(node.index + 1, node.index + 2);
        }
        //determine weight for super script
        //the font we use only has 3 weights so this will determine the best weight to use
        let weight = determineWeight(currentFont.style);
        //properties of super script text
        let superScriptFont = {
            'family': 'EvokeSuperScript',
            'style': weight
        };
        //check if current font is different than existing font
        if (currentFont != superScriptFont) {
            try {
                //import super script + existing font
                yield figma.loadFontAsync(superScriptFont);
                yield figma.loadFontAsync(currentFont);
                if (beforeFont) {
                    yield figma.loadFontAsync(beforeFont);
                }
                if (afterFont) {
                    yield figma.loadFontAsync(afterFont);
                }
                if (numbers.includes(textNode.characters[node.index])) {
                    let newChar = numberSuperscript(textNode.characters[node.index]);
                    textNode.deleteCharacters(node.index, node.index + 1);
                    textNode.insertCharacters(node.index, newChar, 'AFTER');
                }
                //apply font to character
                textNode.setRangeFontName(node.index, node.index + 1, superScriptFont);
                //save info about selection in case we need to convert back later
                let nodeData = {
                    'node': node.node,
                    'index': node.index,
                    'character': textNode.characters[node.index],
                    'oldFont': currentFont
                };
                pluginData.push(nodeData);
                countChanged++;
            }
            catch (err) {
                console.log(err);
                figma.notify('There was an issue applying one of the required fonts.');
                countSkipped++;
            }
            waitToClose();
        }
    }));
}
//wait until all characters are replaced or accounted for
//close the plugin with a summary msg
function waitToClose() {
    if ((countChanged + countSkipped) === textToChange.length) {
        if (command === 'add') {
            figma.root.setPluginData('superScriptData', JSON.stringify(pluginData));
            let language = countChanged > 1 ? 'characters' : 'character';
            figma.closePlugin('Superscript added to ' + countChanged + ' ' + language);
        }
        else {
            let language = countChanged > 1 ? 'characters' : 'character';
            figma.closePlugin('Superscript removed from ' + countChanged + ' ' + language);
        }
    }
}
//function to replace normal numbers with superscript
function numberSuperscript(char) {
    let result;
    if (command === 'remove') {
        result = charMap.filter(character => character.ss === char);
        if (result) {
            return result[0].number.toString();
        }
        else {
            result = char;
        }
    }
    else {
        let charInt = parseInt(char);
        result = charMap.filter(character => character.number === charInt);
        if (result) {
            return result[0].ss;
        }
        else {
            result = char;
        }
    }
    return result.toString();
}
//this is a function to determine the weight of the selection
//since lots of fonts have
function determineWeight(style) {
    let styleName = style.toLowerCase();
    let weight;
    if (styleName.includes('thin') || styleName.includes('hairline') || styleName.includes('light')) {
        weight = 'Light';
    }
    else if (styleName.includes('bold') || styleName.includes('black') || styleName.includes('heavy')) {
        weight = 'Bold';
    }
    else {
        weight = 'Regular';
    }
    return weight;
}
//get plugin data
function populatePluginData() {
    let existingData;
    if (figma.root.getPluginData('superScriptData')) {
        existingData = JSON.parse(figma.root.getPluginData('superScriptData'));
    }
    else {
        existingData = [];
        figma.root.setPluginData('superScriptData', JSON.stringify(existingData));
    }
    return existingData;
}
//function to determine the correct font when removing superscript
function determineFont(textNode, index, currentFont) {
    let fontName;
    //first we want to see if we were able to log the old font
    let pluginDataTextNodes = pluginData.filter(x => x.node.id === textNode.id && x.index === index && x.character === textNode.characters[index]);
    if (pluginDataTextNodes.length > 0) {
        fontName = pluginDataTextNodes[0].oldFont;
        console.log(fontName);
    }
    else {
        //here we will try to find the closest font if we are unable to find a match
        //we will start from the character that comes after, and then before
        if (textNode.getRangeFontName(index + 1, index + 2)) {
            if (textNode.getRangeFontName(index + 1, index + 2) != currentFont) {
                fontName = textNode.getRangeFontName(index + 1, index + 2);
            }
        }
        else if (textNode.getRangeFontName(index - 1, index - 2)) {
            if (textNode.getRangeFontName(index - 1, index - 2) != currentFont) {
                fontName = textNode.getRangeFontName(index - 1, index - 2);
            }
        }
        else if (textNode.getRangeFontName(index + 2, index + 3)) {
            if (textNode.getRangeFontName(index + 2, index + 3) != currentFont) {
                fontName = textNode.getRangeFontName(index + 2, index + 3);
            }
        }
        else if (textNode.getRangeFontName(index - 2, index - 3)) {
            if (textNode.getRangeFontName(index + 2, index + 3) != currentFont) {
                fontName = textNode.getRangeFontName(index + 2, index + 3);
            }
        }
        else {
            fontName = currentFont;
        }
    }
    console.log(fontName);
    return fontName;
}
