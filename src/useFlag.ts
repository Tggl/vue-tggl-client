import { inject, onUnmounted, reactive } from 'vue'
import { Context } from './useTggl'
import { TgglFlagSlug, TgglFlagValue } from 'tggl-client'
import { UnwrapNestedRefs } from '@vue/reactivity'

function useFlag<TSlug extends TgglFlagSlug>(
  slug: TSlug
): UnwrapNestedRefs<{
  active: boolean
  value: TgglFlagValue<TSlug> | undefined
  loading: boolean
  error: any
}>
function useFlag<
  TSlug extends TgglFlagSlug,
  TDefaultValue = TgglFlagValue<TSlug>
>(
  slug: TSlug,
  defaultValue: TDefaultValue
): UnwrapNestedRefs<{
  active: boolean
  value: TgglFlagValue<TSlug> | TDefaultValue
  loading: boolean
  error: any
}>
function useFlag<
  TSlug extends TgglFlagSlug,
  TDefaultValue = TgglFlagValue<TSlug>
>(
  slug: TSlug,
  defaultValue?: TDefaultValue
): UnwrapNestedRefs<{
  active: boolean
  value: TgglFlagValue<TSlug> | TDefaultValue | undefined
  loading: boolean
  error: any
}> {
  const context = inject<Context>('tggl-context')

  if (!context) {
    console.error('TgglError: useFlag should be called within a TgglProvider')

    return {
      value: undefined,
      error: null,
      active: false,
      loading: false,
    }
  }

  const { client, getError, getLoading, onChange } = context

  const flag = reactive<{
    active: boolean
    value: TgglFlagValue<TSlug> | TDefaultValue | undefined
    loading: boolean
    error: any
  }>({
    active: false,
    error: null,
    loading: false,
    value: undefined,
  })

  const removeListener = onChange(() => {
    flag.active = client.isActive(slug)
    // @ts-ignore
    flag.value = client.get(slug, defaultValue)
    flag.error = getError()
    flag.loading = getLoading()
  })

  onUnmounted(removeListener)

  return flag
}

export { useFlag }
