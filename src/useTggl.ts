import { inject } from 'vue'
import { TgglClient, TgglContext, TgglFlagSlug } from 'tggl-client'

export type Context = {
  client: TgglClient
  setContext: (context: Partial<TgglContext>) => void
  updateContext: (context: Partial<TgglContext>) => void
  getLoading: () => boolean
  getError: () => any
  onChange: (callback: () => void) => () => void
  trackFlagEvaluation: (slug: TgglFlagSlug) => void
}

export const useTggl = () => {
  return inject<Context>('tggl-context')
}
