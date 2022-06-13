type SuccessResult<Success> = {
  readonly tag: 'success'
  readonly success: Success
}

type FailureResult<Failure> = {
  readonly tag: 'failure'
  readonly failure: Failure
}

type SuccessOf<ResultLike> = ResultLike extends SuccessResult<infer S> ? S : never
type FailureOf<ResultLike> = ResultLike extends FailureResult<infer F> ? F : never

type Result<Success = unknown, Failure = unknown> = SuccessResult<Success> | FailureResult<Failure>

type PrettyType<V> = Extract<{ [K in keyof V]: V[K] }, unknown>

/**
 * Creates a `storageMap` from third-party `Storage` object.
 *
 * @param storage A `Storage`-like object. Requires only `setItem`, `getItem`, `removeItem` and
 * `clear` methods of standard `Storage` type to be defined.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createStorageMap = (
  storage: Pick<Storage, 'setItem' | 'getItem' | 'removeItem' | 'clear'>
) => {
  const success = <T>(value: T) => ({ tag: 'success', success: value } as const)
  const failure = <T>(error: T) => ({ tag: 'failure', failure: error } as const)

  /**
   * Calls underlying `getItem` function with `key` argument, `JSON.parse`s the received value and
   * validates the result.
   *
   * @param key underlying `getItem` argument
   * @param map validating transform, if validation fails it it should return `FailureResult` and
   * `SuccessResult` otherwise
   *
   * @returns Success or failure result.
   * - If underlying `getItem` function **did throw** an error then a **failure** result containing
   * an object with `key` and `storageError` property set to thrown value will be returned.
   * - If given `key` does not exist a **failure** result containing an object with `key` and
   * `keyNotExistError` properties will be returned.
   * - If validating transform **did throw** an error then a **failure** result containing an object
   * with `key` and `mapError` property set to thrown value will be returned.
   * - If validating transform **did not throw** an error but **fail to validate** the received
   * value then a **failure** result containing an object with `key` and `validationError` property
   * set to validation error will be returned.
   * - If transform function **succeed to validate** the received value then a **success** result
   * containing the transformed value will be returned.
   * */
  function getItem<Success, Failure, ResultLike extends Result<Success, Failure>>(
    key: string,
    map: (value: unknown) => ResultLike
  ): PrettyType<
    | SuccessResult<SuccessOf<ReturnType<typeof map>>>
    | FailureResult<{
        readonly validationError: FailureOf<ReturnType<typeof map>>
        readonly key: string
      }>
    | FailureResult<{ readonly keyNotExistError: undefined; readonly key: string }>
    | FailureResult<{ readonly mapError: unknown; readonly key: string }>
    | FailureResult<{ readonly storageError: unknown; readonly key: string }>
  >

  function getItem(key: string, map: (value: unknown) => Result) {
    try {
      const item = storage.getItem(key)

      // eslint-disable-next-line no-null/no-null
      if (item === null) {
        return failure({ keyNotExistError: undefined, key })
      }

      try {
        const validated = map(JSON.parse(item))

        return validated.tag === 'failure'
          ? failure({ validationError: validated.failure, key })
          : success(validated.success)
      } catch (mapError) {
        return failure({ mapError, key })
      }
    } catch (storageError) {
      return failure({ storageError, key })
    }
  }

  return {
    /**
     * Calls underlying `setItem` function with `key` and `JSON.stringify`ed `value`.
     *
     * @param key underlying `setItem` first argument
     * @param value underlying `setItem` second argument
     *
     * @returns Success or failure result.
     * - If underlying `setItem` function **did throw** an error then a **failure** result
     * containing an object with `key` and `storageError` property set to thrown value will be
     * returned.
     * - If underlying `setItem` function **did not throw** an error then a **success** result
     * containing an `undefined` value will be returned.
     */
    setItem: (key: string, value: unknown) => {
      try {
        storage.setItem(key, JSON.stringify(value))

        return success(undefined)
      } catch (storageError) {
        return failure({ storageError, key })
      }
    },

    getItem,

    /**
     * Calls underlying `removeItem` function with `key` argument.
     *
     * @param key underlying `removeItem` argument
     *
     * @returns Success or failure result.
     * - If underlying `removeItem` function **did throw** an error then a **failure** result
     * containing an object with `key` and `storageError` property set to thrown value will be
     * returned.
     * - If underlying `removeItem` function **did not throw** an error then a **success** result
     * containing an `undefined` value will be returned.
     */
    removeItem: (key: string) => {
      try {
        storage.removeItem(key)

        return success(undefined)
      } catch (storageError) {
        return failure({ storageError, key })
      }
    },

    /**
     * Calls underlying `clear` function.
     *
     * @returns Success or failure result.
     * - If underlying `clear` function **did throw** an error then a **failure** result
     * containing an object with `storageError` property set to thrown value will be returned.
     * - If underlying `clear` function **did not throw** an error then a **success** result
     * containing an `undefined` value will be returned.
     */
    clear: () => {
      try {
        storage.clear()

        return success(undefined)
      } catch (storageError) {
        return failure({ storageError })
      }
    }
  } as const
}
