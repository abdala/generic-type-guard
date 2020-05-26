import * as o from "../objects";
import * as p from "../primitives";
import { FullDummyClass, LargeInterface } from "../dummy_classes.spec";
import { expect } from "chai";
import { IsInterface } from "./interface";
import { TypeGuard } from "../guards";

/* eslint-disable no-magic-numbers */

export interface SimpleInterface {
  str: string;
  num: number;
  b: boolean;
  n: null;
}

/**
 * Compilation tests for the IsInterface class.
 */
describe("Interface", function(this: Mocha.Suite) {
  this.slow(5).timeout(3000);

  // This class is a wrapper around isUnion, most of the real tests happen there.
  it("interface", () => {
    const isSimpleInterface: TypeGuard<SimpleInterface> =
      new IsInterface()
        .withProperty("str", p.isString)
        .withProperty("num", p.isNumber)
        .withProperty("b", p.isBoolean)
        .with(o.hasProperty("n", p.isNull)).get();
    expect(isSimpleInterface({ str: "foo", num: 10, b: false, n: null })).to.equal(true);
    expect(isSimpleInterface({ str: "foo", num: "foo", b: false, n: null })).to.equal(false);
    expect(isSimpleInterface(10)).to.equal(false);
  });

  it("classImplementsInterface", () => {
    const isLargeInterface: TypeGuard<LargeInterface> =
      new IsInterface()
        .with(o.hasProperty("foo", p.isString))
        .withProperty("bar", p.isNumber)
        .withProperty("active", p.isBoolean)
        .get();
    expect(isLargeInterface(new FullDummyClass())).to.equal(true);
  });

  it("stringIndex", () => {
    const isObject: TypeGuard<{ [prop: string]: number }> =
      new IsInterface().withStringIndexSignature(p.isNumber).get();
    const isLooseObject: TypeGuard<{ [prop: string]: number }> =
      new IsInterface().withStringIndexSignature(p.isNumber, false).get();
    expect(isObject({ one: 1, two: 2, three: 3 })).to.equal(true, "filled object");
    expect(isObject({})).to.equal(false, "strict empty object");
    expect(isLooseObject({})).to.equal(true, "loose empty object");
  });

  it("numberIndex", () => {
    const isArrayLike: TypeGuard<{ [prop: number]: string }> =
      new IsInterface().withNumericIndexSignature(p.isString).get();
    const isLooseArrayLike: TypeGuard<{ [prop: number]: string }> =
      new IsInterface().withNumericIndexSignature(p.isString, false).get();
    expect(isArrayLike(["one", "two", "three"])).to.equal(true, "filled array");
    expect(isArrayLike([])).to.equal(false, "strict empty array");
    expect(isLooseArrayLike([])).to.equal(true, "loose empty array");
  });

  it("combinedIndex", () => {
    const isWeirdArray: TypeGuard<{ [prop: number]: string; foo: string }> =
      new IsInterface().withProperty("foo", p.isString).withNumericIndexSignature(p.isString).get();
    const isLooselyWeirdArray: TypeGuard<{ [prop: number]: string; foo: string }> =
      new IsInterface().withProperty("foo", p.isString).withNumericIndexSignature(p.isString, false).get();
    const isWeirdObject: TypeGuard<{ [prop: string]: string; 0: string }> =
      new IsInterface().withProperty("0", p.isString).withStringIndexSignature(p.isString).get();
    const isLooselyWeirdObject: TypeGuard<{ [prop: string]: string; 0: string }> =
      new IsInterface().withProperty("0", p.isString).withStringIndexSignature(p.isString, false).get();
    expect(isWeirdArray({ 0: "foo", foo: "bar" })).to.equal(true);
    expect(isWeirdArray({ foo: "bar" })).to.equal(false);
    expect(isLooselyWeirdArray({ foo: "bar" })).to.equal(true);
    expect(isWeirdObject({ foo: "bar", 0: "baz" })).to.equal(true);
    expect(isWeirdObject({ 0: "baz" })).to.equal(false);
    expect(isLooselyWeirdObject({ 0: "baz" })).to.equal(true);
  });

  it("emptyInterface", () => {
    const isEmptyInterface: TypeGuard<object> =
      new IsInterface().get();
    expect(isEmptyInterface({})).to.equal(true);
    expect(isEmptyInterface({ foo: "bar" })).to.equal(true);
    expect(isEmptyInterface(10)).to.equal(false);
  });

  it("withProperties", () => {
    const isSimpleInterface: TypeGuard<SimpleInterface> =
      new IsInterface()
        .withProperties({
          b: p.isBoolean,
          n: p.isNull,
        })
        .withProperties({
          num: p.isNumber,
          str: p.isString,
        })
        .get();
    expect(isSimpleInterface({ str: "foo", num: 10, b: false, n: null })).to.equal(true);
    expect(isSimpleInterface({ str: "foo", num: "foo", b: false, n: null })).to.equal(false);
    expect(isSimpleInterface({ str: "foo", num: 10, b: false })).to.equal(false);
    expect(isSimpleInterface(10)).to.equal(false);
  });
});
