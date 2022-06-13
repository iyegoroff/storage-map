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

Read the docs [here](https://iyegoroff.github.io/storage-map/modules.html#createstorage-map) and check how `storage-map` infers types at the [playground](https://www.typescriptlang.org/play?jsx=0#code/JYWwDg9gTgLgBAbzgYygUwIYzQMTTZACxAzDgF84AzKCEOAcivyJLAYCgPkIA7AZ3j8ArsmRp+-OAF44AHgAqAPgAUANwwAbYWgBccBQEoZSuCqQwMAc30MRYifwYAaOPfGT9G7WgpwMUjwCMIbcfILUGMDa6DLyyipoULRQ+kYmZhbWtlRRMWgukdHC6PpJKX4BKOEhXEERzATEpHGomNh4TWwqjUShYcFwJZpxDIQwMGC6APTTmhDIWoQQgroArAAMG2ucAxEAVsKCAEoSkAK+sr3NYObkrsP99fAgCwDWACJYGABqWsAAEyw0DiKiBln0wl4b14EAA7rxjNJTOCMDJpLIGMBeN5AXBUQBCBhwAD8RXyKixOP+AOJVWexn07kc5nx3woTxqcH2-D4f00gKwaABcQwcKi8Gu3SQEDe+iQPL4+leyE+335gpgIMo9yGUE0-WAVDMit4GvBwoAdJYrOjMczJAxjAgOHA3dUBBBNGhLfMrJSHfxdIVTeahQDLYHQpQ0Jp+L4Xe6Pbzvb6IP6mHkSnoQ7yzTTw5bcsV0NG6lyAEbzCsAZVEHn4AEFeACFGgAB4wHBZ2JXFg3Vmy+VwKsQCv6dsZQMqdvGXWwmAAeTliDg2E7E6n9ZZs78use5cGsIAQhAAQBPOsOSRxKWkQcrpAns-n-QqKBI0zTqCRywwI5zhQDz6pygwgMImgwMAYDegAsqQUh9l096Ju6ABMWzDhgyQYOex7CFQzCpHAk7Im426SDOc7OK67oACwbHRw5UNAIBfBCJFbte-BUUBtFukOq7rjAm5kdOu73PxcALsuw7Pheb4flxDbvta55gGgc4cPuIGHhE6AAI46IIACSvDAEuYAwIh1D9tKOmaK4SAgPgywArYAAKi41gohRtACaC8FBWhBow2LINoAXEuQoRAA). Also there is a compatible result library - [ts-railway](https://github.com/iyegoroff/ts-railway).

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
