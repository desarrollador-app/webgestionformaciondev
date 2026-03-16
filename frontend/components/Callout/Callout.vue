<template>
    <div :class="['custom-callout', getMessageClass(type)]">
      <Icon 
        :icon="getMessageIcon(type)"
        size="24px"
      />
      <span>{{ text }}</span>
    </div>
  </template>
  
<script>
import { computed } from 'vue';
import { Icon } from '@/components/Icon';

// Definir MessageType como constante fuera del setup
export const MessageType = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

export default {
  name: 'Callout',
  components: {
    Icon
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => Object.values(MessageType).includes(value)
    },
    text: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const type = computed(() => props.type);
    const text = computed(() => props.text);

    const getMessageClass = (type) => {
      switch (type) {
      case MessageType.INFO:
        return 'custom-callout--info';
      case MessageType.SUCCESS:
        return 'custom-callout--success';
      case MessageType.WARNING:
        return 'custom-callout--warning';
      case MessageType.ERROR:
        return 'custom-callout--error';
      default:
        return '';
      }
    };

    const getMessageIcon = (type) => {
      switch (type) {
      case MessageType.INFO:
        return 'information-outline';
      case MessageType.SUCCESS:
        return 'check-circle';
      case MessageType.WARNING:
        return 'alert-circle';
      case MessageType.ERROR:
        return 'close-circle';
      default:
        return 'information';
      }
    };

    return {
      type,
      text,
      getMessageClass,
      getMessageIcon
    };
  }
};
</script>
  <style lang="scss">
    @use "../Callout/styles";
  </style>