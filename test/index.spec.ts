import { rmSync } from 'fs'
import { LocalStorage } from 'node-localstorage'
import { createStorageMap } from '../src'

const dir = './tmp'

const storage = new LocalStorage(dir)
const storageMap = createStorageMap(storage)

const broken = (name: string) => () => {
  throw new Error(`${name} is broken`)
}

const brokenStorage = {
  getItem: broken('getItem'),
  setItem: broken('setItem'),
  removeItem: broken('removeItem'),
  clear: broken('clear')
}

const brokenStorageMap = createStorageMap(brokenStorage)

const success = <T>(value: T) => ({ tag: 'success', success: value } as const)
const failure = <T>(error: T) => ({ tag: 'failure', failure: error } as const)

describe('storage-map', () => {
  afterAll(() => rmSync(dir, { recursive: true }))

  afterEach(() => storage.clear())

  test('setItem - success', () => {
    const key = 'test-1'
    const result = storageMap.setItem(key, 1)

    expect(result).toEqual<typeof result>(success(undefined))
    expect(storage.getItem(key)).toEqual(JSON.stringify(1))
  })

  test('setItem - storageError failure', () => {
    const key = 'test-1'
    const result = brokenStorageMap.setItem(key, 1)

    expect(result).toEqual<typeof result>(
      failure({ storageError: new Error('setItem is broken'), key })
    )
  })

  test('getItem - success', () => {
    const key = 'test-2'
    storageMap.setItem(key, 'test')
    const result = storageMap.getItem(key, (value) =>
      typeof value === 'string' ? success(value) : failure('not a string' as const)
    )

    expect(result).toEqual<typeof result>(success('test'))
  })

  test('getItem - storageError failure', () => {
    const key = 'test-2'
    const result = brokenStorageMap.getItem(key, (value) =>
      typeof value === 'string' ? success(value) : failure('not a string' as const)
    )

    expect(result).toEqual<typeof result>(
      failure({ storageError: new Error('getItem is broken'), key })
    )
  })

  test('getItem - keyDoesNotExist failure', () => {
    const key = 'test-2'
    const invalidKey = '???'
    storageMap.setItem(key, 'test')
    const result = storageMap.getItem(invalidKey, (value) =>
      typeof value === 'string' ? success(value) : failure('not a string' as const)
    )

    expect(result).toEqual<typeof result>(failure({ keyNotExistError: undefined, key: invalidKey }))
  })

  test('getItem - validationError failure', () => {
    const key = 'test-2'
    storageMap.setItem(key, 'test')
    const result = storageMap.getItem(key, (value) =>
      typeof value === 'number' ? success(value) : failure('not a number' as const)
    )

    expect(result).toEqual<typeof result>(
      failure({ validationError: 'not a number' as const, key })
    )
  })

  test('getItem - mapError failure', () => {
    const key = 'test-2'
    storage.setItem(key, 'test')
    const result = storageMap.getItem(key, (value) =>
      typeof value === 'string' ? success(value) : failure('not a string' as const)
    )

    expect(result).toEqual<typeof result>(
      failure({ mapError: new SyntaxError('Unexpected token e in JSON at position 1'), key })
    )
  })

  test('removeItem - success', () => {
    const key = 'test-3'
    const value = { value: 'test' }
    storageMap.setItem(key, value)

    expect(storage.getItem(key)).toEqual(JSON.stringify(value))

    const result = storageMap.removeItem(key)

    expect(result).toEqual<typeof result>(success(undefined))
    expect(storage.getItem(key)).toBeNull()
    expect(storage.length).toEqual(0)
  })

  test('removeItem - storageError failure', () => {
    const key = 'test-3'

    const result = brokenStorageMap.removeItem(key)

    expect(result).toEqual<typeof result>(
      failure({ storageError: new Error('removeItem is broken'), key })
    )
  })

  test('clear - success', () => {
    const keyA = 'test-4-a'
    const keyB = 'test-4-b'
    const valueA = { value: 'test' }
    const valueB = [1, 2, 3]
    storageMap.setItem(keyA, valueA)
    storageMap.setItem(keyB, valueB)

    expect(storage.getItem(keyA)).toEqual(JSON.stringify(valueA))
    expect(storage.getItem(keyB)).toEqual(JSON.stringify(valueB))

    const result = storageMap.clear()

    expect(result).toEqual<typeof result>(success(undefined))
    expect(storage.getItem(keyA)).toBeNull()
    expect(storage.getItem(keyB)).toBeNull()
    expect(storage.length).toEqual(0)
  })

  test('clear - storageError failure', () => {
    const result = brokenStorageMap.clear()

    expect(result).toEqual<typeof result>(failure({ storageError: new Error('clear is broken') }))
  })
})
