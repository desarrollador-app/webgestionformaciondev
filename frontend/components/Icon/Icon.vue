<template>
  <i 
    :class="iconClasses" 
    :style="iconStyles"
  ></i>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: '24px'
  },
  color: {
    type: String,
    default: 'currentColor'
  },
  class: {
    type: [String, Array],
    default: undefined
  }
});

const iconClasses = computed(() => {
	const classes = ['mdi', 'base-icon'];
  
	if (props.icon.startsWith('mdi-')) {
		classes.push(props.icon);
	} else {
		classes.push(`mdi-${props.icon}`);
	}

	if (props.class) {
		if (Array.isArray(props.class)) {
			classes.push(...props.class);
		} else {
			classes.push(props.class);
		}
	}

	return classes;
});

const iconStyles = computed(() => {
	const styles = {};
  
	if (typeof props.size === 'number') {
		styles.fontSize = `${props.size}px`;
		styles.width = `${props.size}px`;
		styles.height = `${props.size}px`;
	} else {
		styles.fontSize = props.size;
		styles.width = props.size;
		styles.height = props.size;
	}
  
	if (props.color !== 'currentColor') {
		styles.color = props.color;
	}
  
	return styles;
});
</script>

<style lang="scss">
@use "./styles";
</style>
