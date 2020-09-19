# Superscript
A Figma plugin for superscripting characters

## Preface
When using making characters Superscript in Figma, Figma relies on OpenType features and a dedicated character set of "proper/true" superscript characters to substitute. However, if a font does not have those characters, or a superscript version of the character does not exist, you cannot leverage this feature. This plugin enables you to superscript a set of common characters.

## How it works
The font takes a selection of text, looks for "superscriptable" characters that the plugin supports, and substitutes them out using a dedicated font that you will need to install to use (see How to install below). The plugin supports the following characters:

```Javascript
'™', '℠', '®', '§', '†', '*', '¤', '¶', '©', // reference marks
'0', '1', '2', '3', '4', '5', '6', '7', '8', '9' //numbers
```
The plugin has two menu commands, "Add Superscript" and "Remove Superscript". The "Add" function simply looks for supported characters, determines the best weight of the superscript font to substitute. Every time the plugin runs, it logs data to the file about which characters have been superscripted. The "Remove" command will make an attempt tp unsuperscript the selected characters. It does this by first looking for data that was logged during the Add process. For it to find a match it needs to find the same character, in the same spot, in the same textbox to accurately replace it with the old font. If this data does not exist (usually because the position of the chatacter has changed due to text being edited in the text box, the plugin will try to identify the correct font and weight using characters after and before it).


## How to install
1. Download the plugin code from this repo to a directory
2. Install the fonts located in the `fonts` directory
3. Using the Figma Desktop app, add this plugin to Figma. You can do this from your list of plugins under your user profile. Under the "In Development" header, choose "Create new Plugin" by clicking the + button. From here you want to point to the `manifest.json` file in your plugin directory.
4. (Optional) If you are on a Figma Organization plan, upload the font as a Shared Font, and publish your plugin privately to your company.

## Future plans
I don't have any future plans for this, but would happy to consider supporting it further if there were additional characters or subscript substitutions that would be helpful to someone. Unfortunately my trials ran out for font-editing software and it is hard to justify the cost for such a small project. 
