import { describe, it, expect } from 'vitest'
import { doSomeStuff } from './index'

// The two tests marked with concurrent will be run in parallel
describe('suite', () => {
  it('proof it works', () => {
    expect(doSomeStuff("hello")).toBe(5);
  })
  it('proof it works too', () => {
    expect(doSomeStuff("hello")).toBe(5);
  })
})