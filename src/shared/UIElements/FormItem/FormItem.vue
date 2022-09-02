<template>
    <b-input
        :id="inputId"
        v-if="type == InputType.Text || type == InputType.Number"
        v-model="inputValue"
        :type="(type == InputType.Number) ? 'number' : 'text'"
        :class="inputClass"
        v-bind="inputAttributes"
    ></b-input>
    <b-textarea
        :id="inputId"
        v-else-if="type == InputType.Textarea"
        v-model="inputValue"
        :class="inputClass"
        v-bind="inputAttributes"
    ></b-textarea>
    <b-checkbox
        :id="inputId"
        v-else-if="type == InputType.Checkbox"
        v-model="inputValue"
        :class="inputClass"
        v-bind="inputAttributes"
    >
        <slot />
    </b-checkbox>
    <b-radio
        :id="inputId"
        v-else-if="type == InputType.Radio"
        v-model="inputValue"
        :class="inputClass"
        v-bind="inputAttributes"
    >
        <slot />
    </b-radio>
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
            return `${id}-input`;
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
                        "inline"
                    ];
                    break;
                case InputType.Radio:
                    allowedAttributes = [];
                    break;
                case InputType.Dropdown:
                    allowedAttributes = [
                        'items'
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