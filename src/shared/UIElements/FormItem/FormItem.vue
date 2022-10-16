<template>
    <b-input
        v-if="type == InputType.Text || type == InputType.Number"
        :id="inputId"
        v-model="inputValue"
        :type="(type == InputType.Number) ? 'number' : 'text'"
        :class="inputClass"
        v-bind="inputAttributes"
    ></b-input>

    <b-textarea
        v-else-if="type == InputType.Textarea"
        :id="inputId"
        v-model="inputValue"
        :class="inputClass"
        v-bind="inputAttributes"
    ></b-textarea>

    <b-checkbox-group
        v-else-if="type == InputType.Checkbox"
        :id="inputId"
        v-model="inputValue"
        :class="inputClass"
        v-bind="inputAttributes"
    ></b-checkbox-group>

    <b-radio-group
        v-else-if="type == InputType.Radio"
        :id="inputId"
        v-model="inputValue"
        :class="inputClass"
        v-bind="inputAttributes"
    >
    </b-radio-group>
    
    <b-form-select
        v-else-if="type == InputType.Dropdown"
        :id="inputId"
        v-model="inputValue"
        :class="inputClass"
        v-bind="inputAttributes"
    >
    </b-form-select>
</template>

<script>
import InputType from "@/shared/constants/InputType";

export default {
    components: {},
    props: {
        id: String,
        value: {
            default: null
        },
        type: {
            type: Symbol,
            default: InputType.Text
        },
        state: {
            type: Boolean,
            default: false
        },
        inputClass: {
            type: Object,
            default: () => ({})
        },
        attributes: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        inputValue: {
            get() {
                return this.value;
            },
            set(value) {
                this.$emit('input', value);
            }
        },
        inputId: function () {
            return `${this.id}-input`;
        },
        InputType: function() {
            return InputType;
        },
        inputAttributes: function () {
            let allowedAttributes = [];
            let attributes = {};
            switch (this.type) {
                case InputType.Text:
                    allowedAttributes = [
                        'placeholder'
                    ];
                    break;
                case InputType.Number:
                    allowedAttributes = [
                        'placeholder',
                        'min',
                        'max',
                        'step'
                    ];
                    break;
                case InputType.Textarea:
                    allowedAttributes = [
                        'placeholder',
                        'rows',
                        'max-rows'
                    ];
                    break;
                case InputType.Checkbox:
                    allowedAttributes = [
                        "options",
                        "stacked"
                    ];
                    break;
                case InputType.Radio:
                    allowedAttributes = [
                        "options",
                        "stacked"
                    ];
                    break;
                case InputType.Dropdown:
                    allowedAttributes = [
                        "options",
                        "multiple"
                    ];
                    break;
                default:
                    break;
            }
            allowedAttributes.forEach(attr => {
                if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
                    attributes[attr] = this.attributes[attr];
                }
            });
            return attributes;
        }
    }
}
</script>