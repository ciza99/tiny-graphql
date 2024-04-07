import { describe, expect, it, vi } from "vitest";
import { observableFactory } from "./observable";
import { Observer } from "./observer";
import { map } from "./operators";

describe("observableFactory", () => {
  it("should create an observable that emits values", () => {
    const observable = observableFactory<number, string>((observer) => {
      observer.next(1);
      observer.error("Error");
      observer.complete();

      return () => {
        console.log("Unsubscribed");
      };
    });

    const observer: Observer<number, string> = {
      next: vi.fn(),
      error: vi.fn(),
      complete: vi.fn(),
    };

    const unsubscribe = observable.subscribe(observer);

    expect(observer.next).toHaveBeenCalledWith(1);
    expect(observer.error).toHaveBeenCalledWith("Error");
    expect(observer.complete).toHaveBeenCalled();

    unsubscribe();
  });
});

describe("pipe", () => {
  it("should handle operators correctly", () => {
    const observable = observableFactory<number, string>((observer) => {
      observer.next(2);
      observer.next(3);

      return () => {};
    });

    const observer: Observer<number, string> = {
      next: vi.fn(),
      error: vi.fn(),
      complete: vi.fn(),
    };

    const unsubscribe = observable
      .pipe(map((value) => value * value))
      .subscribe(observer);

    expect(observer.next).toHaveBeenCalledWith(4);
    expect(observer.next).toHaveBeenCalledWith(9);

    expect(observer.next).toHaveBeenCalledTimes(2);

    unsubscribe();
  });
});
