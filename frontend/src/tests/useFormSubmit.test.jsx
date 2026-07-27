import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormSubmit } from '../hooks/useFormSubmit'

describe('useFormSubmit', () => {
  it('short-circuits on validation errors and never calls submit', async () => {
    const submit = vi.fn()
    const onValidationError = vi.fn()
    const validate = vi.fn(() => ({ name: 'required', email: 'required' }))

    const { result } = renderHook(() =>
      useFormSubmit({ validate, submit, onValidationError }),
    )

    await act(async () => {
      await result.current.handleSubmit({ name: '' })
    })

    expect(submit).not.toHaveBeenCalled()
    expect(result.current.fieldErrors).toEqual({ name: 'required', email: 'required' })
    // First (topmost) invalid field is passed for focus.
    expect(onValidationError).toHaveBeenCalledWith('name')
    expect(result.current.attempted).toBe(true)
  })

  it('calls submit and marks submitted on success', async () => {
    const submit = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useFormSubmit({ validate: () => ({}), submit }),
    )

    await act(async () => {
      await result.current.handleSubmit({ name: 'Priya' })
    })

    expect(submit).toHaveBeenCalledWith({ name: 'Priya' })
    expect(result.current.submitted).toBe(true)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("surfaces the thrown error's message", async () => {
    const submit = vi.fn().mockRejectedValue(new Error('Server exploded'))
    const { result } = renderHook(() =>
      useFormSubmit({ validate: () => ({}), submit }),
    )

    await act(async () => {
      await result.current.handleSubmit({ name: 'Priya' })
    })

    expect(result.current.error).toBe('Server exploded')
    expect(result.current.submitted).toBe(false)
  })

  it('falls back to a generic message when the error has none', async () => {
    const submit = vi.fn().mockRejectedValue(new Error(''))
    const { result } = renderHook(() =>
      useFormSubmit({ validate: () => ({}), submit }),
    )

    await act(async () => {
      await result.current.handleSubmit({})
    })

    expect(result.current.error).toMatch(/Something went wrong/)
  })

  it('revalidate is a no-op until the first submit attempt', () => {
    const validate = vi.fn(() => ({ name: 'bad' }))
    const { result } = renderHook(() =>
      useFormSubmit({ validate, submit: vi.fn() }),
    )

    act(() => result.current.revalidate({ name: '' }))
    // Not attempted yet → validate not run, no field errors shown.
    expect(validate).not.toHaveBeenCalled()
    expect(result.current.fieldErrors).toEqual({})
  })

  it('revalidate re-runs validation after an attempt', async () => {
    const validate = vi
      .fn()
      .mockReturnValueOnce({ name: 'bad' }) // first submit
      .mockReturnValueOnce({}) // revalidate after fix

    const { result } = renderHook(() =>
      useFormSubmit({ validate, submit: vi.fn() }),
    )

    await act(async () => {
      await result.current.handleSubmit({ name: '' })
    })
    expect(result.current.fieldErrors).toEqual({ name: 'bad' })

    act(() => result.current.revalidate({ name: 'Priya' }))
    expect(result.current.fieldErrors).toEqual({})
  })
})
