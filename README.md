# storage-map

[![npm](https://img.shields.io/npm/v/storage-map)](https://npm.im/storage-map)
[![build](https://github.com/iyegoroff/storage-map/workflows/build/badge.svg)](https://github.com/iyegoroff/storage-map/actions/workflows/build.yml)
[![publish](https://github.com/iyegoroff/storage-map/workflows/publish/badge.svg)](https://github.com/iyegoroff/storage-map/actions/workflows/publish.yml)
[![codecov](https://codecov.io/gh/iyegoroff/storage-map/branch/main/graph/badge.svg?token=YC314L3ZF7)](https://codecov.io/gh/iyegoroff/storage-map)
[![Type Coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fiyegoroff%2Fts-railway%2Fmain%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/storage-map)
[![Bundlephobia](https://img.shields.io/bundlephobia/minzip/storage-map?label=min+gzip)](https://bundlephobia.com/package/storage-map)
[![npm](https://img.shields.io/npm/l/storage-map.svg?t=1495378566926)](https://www.npmjs.com/package/storage-map)

<!-- [![Bundlephobia](https://badgen.net/bundlephobia/minzip/storage-map?label=min+gzip)](https://bundlephobia.com/package/storage-map) -->

Non-throwing Storage API wrapper

## Getting started

```
npm i storage-map
```

## Description

This is a simple wrapper for a `Storage`-like object. It converts standard `Storage` methods `getItem`, `setItem`, `removeItem` and `clear` into functions that catch all possible exceptions and return a 'success or failure' wrapped value. Converted `getItem` takes an additional argument - a validating transform.

Read the docs [here](https://iyegoroff.github.io/storage-map/modules.html#createstorage-map) and check how `storage-map` infers types at the [playground](https://www.typescriptlang.org/play?jsx=0#code/JYWwDg9gTgLgBAbzgYygUwIYzQZRtDAczQFkMw4BfOAMyghDgHIBnfKItAWhHKYChQkWIjjAWAJTTJoAEyq16jJjBZdxXdDKiyB-GQDs2cFgFdkyNCxZwAvHAA8AFQB8ACgBuGADam0ALjgnAEo7Fzg3JBgiQNZzS2smABoTeKsWQK9fNAUMG0M2YP0II3gaDGBfdDtHVzc0KHooQJCwiKiY5nLK03Rk2gqqgLgGptz8ksL+YtKTdk4a1ExsPAJiMjA3bwhkH1WOYiKZ4xY0GCkzb3h7NjW0ADpTmABJbBA3FSsYfqivwIBGKhHArwYjnKymK41W4HB5g15od78OAo5jYNjJZGozw+UK2cLiKTaWQ47yhABk5LRXyYYgMcCycEpcBgAE8wGgIDQGT57ujrrZ7EwDKYQAAjBq0gD8qQs6VJoUC3SGH1kWAwPO8wDVMGAJQGlTQujgeRQkxgRWB5rg6BAEA8aAukOuczu91t9rQCPenwxVtmyG8mCgTqhN3mxHugeDbiKQA). Also there is a compatible result library - [ts-railway](https://github.com/iyegoroff/ts-railway).

## Example

```ts
import { createStorageMap } from 'storage-map'
import { LocalStorage } from 'node-localstorage'
import { isRecord } from 'ts-is-record'

// storage-map compatible result creators
const success = <T>(value: T) => ({ tag: 'success', success: value } as const)
const failure = <T>(error: T) => ({ tag: 'failure', failure: error } as const)

// wrap any Storage-like object
const storageMap = createStorageMap(new LocalStorage('./tmp'))

// value will be stringified
storageMap.setItem('key', { value: 'test' })

// associated value should be validated
const result = storageMap.getItem('key', (value) =>
  isRecord(value) && 'value' in value && typeof value.value === 'string'
    ? success(value)
    : failure('data validation failed' as const)
)

expect(result).toEqual({ tag: 'success', success: { value: 'test' } })
```
