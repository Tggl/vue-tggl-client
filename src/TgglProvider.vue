<script setup lang="ts">
import { onMounted, provide } from 'vue'
import {TgglClient, TgglContext, TgglFlagSlug, TgglFlagValue} from 'tggl-client'

const {
  client,
  initialContext = {},
  onFlagEvaluation = () => null,
} = defineProps<{
  client: TgglClient
  initialContext?: Partial<TgglContext>
  onFlagEvaluation?: <TSlug extends TgglFlagSlug>(opts: {
    slug: TSlug
    active: boolean
    value: TgglFlagValue<TSlug>
  }) => void
}>()

const state = {
  context: initialContext,
  loading: 0,
  loadedOnce: false,
  error: null as any,
  onChange: new Map<string, () => void>(),
}

const setContext = (context: Partial<TgglContext>) => {
  state.context = context
  state.loading++
  state.loadedOnce = true
  state.error = null
  for (const callback of state.onChange.values()) {
    callback()
  }
  client
    .setContext(context)
    .catch((error) => {
      state.error = error
    })
    .then(() => {
      state.loading--
      for (const callback of state.onChange.values()) {
        callback()
      }
    })
}

let counter = 0

const tgglContext: TgglContext = {
  client,
  setContext,
  updateContext: (context: Partial<TgglContext>) =>
      setContext({ ...state.context, ...context }),
  getLoading: () => state.loading > 0 && !state.loadedOnce,
  getError: () => state.error,
  onChange: (callback: () => void) => {
    const key = String(counter++)
    state.onChange.set(key, callback)
    return () => state.onChange.delete(key)
  },
  trackFlagEvaluation: (slug: TgglFlagSlug) =>
    onFlagEvaluation({
      slug,
      active: client.isActive(slug),
      value: client.get(slug, null),
    }),
}

provide('tggl-context', tgglContext)

onMounted(() => {
  setContext(initialContext)
})
</script>

<template>
  <slot></slot>
</template>