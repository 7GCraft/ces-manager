module.exports = class InputType {
    static Text = Symbol("Text");
    static Number = Symbol("Number");
    static Checkbox = Symbol("Checkbox");
    static Radio = Symbol("Radio");
    static Dropdown = Symbol("Dropdown");
    static Textarea = Symbol("Textarea");
    static CheckboxGroup = Symbol("CheckboxGroup");

    constructor() {}
}