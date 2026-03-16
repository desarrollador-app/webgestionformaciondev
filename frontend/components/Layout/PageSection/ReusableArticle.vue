<template>
  <article class="section-content">
    <div class="section-content__header content-header">
      <h2 class="content-header__title">{{ title }}</h2>
      <div class="header-action">
        <slot name="header-action" />
      </div>
    </div>
    <ul class="section-content__list">
      <li v-for="(value, key) in listData" :key="key">
        <span class="label">{{ formatLabel(key) }}:</span> <span>{{ value }}</span>
      </li>
    </ul>
    <div class="section-content__table">
      <slot name="table"></slot>
    </div>
    <div class="section-content__misc">
      <slot name="misc"></slot>
    </div>
  </article>
</template>

<script>
import { formatLabel } from '@/utils/functions.js'

export default {
  name: 'ReusableArticle',
  props: {
    title: {
      type: String,
      required: true
    },
    listData: {
      type: Object,
    }
  },
  methods: {
    formatLabel
  }
}
</script>

<style lang="scss">
@use "./styles";
</style>
