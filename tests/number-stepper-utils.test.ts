// Unit tests for NumberStepper utility logic

// Helper functions (extracted from NumberStepper logic)
const clampValue = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

const parseInputValue = (value: string): number | null => {
  if (value === "") return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};

const calculateStepValue = (currentValue: number | null, delta: number, min: number, max: number): number => {
  const current = currentValue || 0;
  const newValue = current + delta;
  return Math.min(max, Math.max(min, newValue));
};

const isDecrementDisabled = (value: number | null, min: number): boolean => {
  const current = value || 0;
  return current <= min;
};

const isIncrementDisabled = (value: number | null, max: number): boolean => {
  const current = value || 0;
  return current >= max;
};

const handleBlurValue = (value: number | null, min: number): number => {
  return isNaN(value as number) || value === null ? min : value;
};

describe("NumberStepper Utility Logic", () => {
  describe("value clamping", () => {

    it("should clamp values to minimum", () => {
      expect(clampValue(-5, 0, 10)).toBe(0);
      expect(clampValue(-100, 5, 20)).toBe(5);
    });

    it("should clamp values to maximum", () => {
      expect(clampValue(15, 0, 10)).toBe(10);
      expect(clampValue(100, 5, 20)).toBe(20);
    });

    it("should not change values within range", () => {
      expect(clampValue(5, 0, 10)).toBe(5);
      expect(clampValue(15, 10, 20)).toBe(15);
    });

    it("should handle edge cases", () => {
      expect(clampValue(0, 0, 10)).toBe(0);
      expect(clampValue(10, 0, 10)).toBe(10);
    });

    it("should handle when min equals max", () => {
      expect(clampValue(5, 10, 10)).toBe(10);
      expect(clampValue(15, 10, 10)).toBe(10);
    });
  });

  describe("input parsing", () => {

    it("should parse valid integers", () => {
      expect(parseInputValue("5")).toBe(5);
      expect(parseInputValue("123")).toBe(123);
      expect(parseInputValue("0")).toBe(0);
    });

    it("should handle empty strings", () => {
      expect(parseInputValue("")).toBe(null);
    });

    it("should handle invalid inputs", () => {
      expect(parseInputValue("abc")).toBe(null);
      expect(parseInputValue("12.5")).toBe(12); // parseInt truncates decimals
      expect(parseInputValue("12abc")).toBe(12); // parseInt stops at invalid char
    });

    it("should handle negative numbers", () => {
      expect(parseInputValue("-5")).toBe(-5);
      expect(parseInputValue("-123")).toBe(-123);
    });

    it("should handle leading/trailing spaces", () => {
      expect(parseInputValue(" 5 ")).toBe(5);
      expect(parseInputValue("  123  ")).toBe(123);
    });
  });

  describe("step calculation", () => {

    it("should increment value correctly", () => {
      expect(calculateStepValue(5, 1, 0, 10)).toBe(6);
      expect(calculateStepValue(0, 1, 0, 10)).toBe(1);
    });

    it("should decrement value correctly", () => {
      expect(calculateStepValue(5, -1, 0, 10)).toBe(4);
      expect(calculateStepValue(10, -1, 0, 10)).toBe(9);
    });

    it("should respect minimum bounds", () => {
      expect(calculateStepValue(0, -1, 0, 10)).toBe(0);
      expect(calculateStepValue(5, -10, 0, 10)).toBe(0);
    });

    it("should respect maximum bounds", () => {
      expect(calculateStepValue(10, 1, 0, 10)).toBe(10);
      expect(calculateStepValue(5, 10, 0, 10)).toBe(10);
    });

    it("should handle null current value", () => {
      expect(calculateStepValue(null, 1, 0, 10)).toBe(1);
      expect(calculateStepValue(null, -1, 0, 10)).toBe(0);
    });

    it("should handle large step values", () => {
      expect(calculateStepValue(5, 100, 0, 10)).toBe(10);
      expect(calculateStepValue(5, -100, 0, 10)).toBe(0);
    });
  });

  describe("button state logic", () => {

    describe("decrement button", () => {
      it("should be disabled at minimum value", () => {
        expect(isDecrementDisabled(0, 0)).toBe(true);
        expect(isDecrementDisabled(5, 5)).toBe(true);
      });

      it("should be enabled above minimum", () => {
        expect(isDecrementDisabled(1, 0)).toBe(false);
        expect(isDecrementDisabled(10, 5)).toBe(false);
      });

      it("should handle null values", () => {
        expect(isDecrementDisabled(null, 0)).toBe(true);
        expect(isDecrementDisabled(null, 5)).toBe(true);
      });
    });

    describe("increment button", () => {
      it("should be disabled at maximum value", () => {
        expect(isIncrementDisabled(10, 10)).toBe(true);
        expect(isIncrementDisabled(999, 999)).toBe(true);
      });

      it("should be enabled below maximum", () => {
        expect(isIncrementDisabled(9, 10)).toBe(false);
        expect(isIncrementDisabled(0, 999)).toBe(false);
      });

      it("should handle null values", () => {
        expect(isIncrementDisabled(null, 10)).toBe(false);
        expect(isIncrementDisabled(null, 0)).toBe(true);
      });
    });
  });

  describe("blur handling", () => {

    it("should reset NaN to minimum", () => {
      expect(handleBlurValue(NaN, 0)).toBe(0);
      expect(handleBlurValue(NaN, 5)).toBe(5);
    });

    it("should reset null to minimum", () => {
      expect(handleBlurValue(null, 0)).toBe(0);
      expect(handleBlurValue(null, 10)).toBe(10);
    });

    it("should keep valid values", () => {
      expect(handleBlurValue(5, 0)).toBe(5);
      expect(handleBlurValue(15, 10)).toBe(15);
    });

    it("should handle zero values", () => {
      expect(handleBlurValue(0, 0)).toBe(0);
      expect(handleBlurValue(0, 5)).toBe(0);
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete increment workflow", () => {
      const min = 0, max = 10;
      let value = 5;
      
      // Increment
      value = calculateStepValue(value, 1, min, max);
      expect(value).toBe(6);
      expect(isIncrementDisabled(value, max)).toBe(false);
      expect(isDecrementDisabled(value, min)).toBe(false);
    });

    it("should handle complete decrement workflow", () => {
      const min = 0, max = 10;
      let value = 1;
      
      // Decrement to minimum
      value = calculateStepValue(value, -1, min, max);
      expect(value).toBe(0);
      expect(isDecrementDisabled(value, min)).toBe(true);
      expect(isIncrementDisabled(value, max)).toBe(false);
    });

    it("should handle input parsing and validation", () => {
      const min = 0, max = 999;
      
      // Valid input
      let parsed = parseInputValue("50");
      let clamped = clampValue(parsed!, min, max);
      expect(clamped).toBe(50);
      
      // Invalid input -> blur reset
      parsed = parseInputValue("abc");
      let final = handleBlurValue(parsed, min);
      expect(final).toBe(0);
    });

    it("should handle edge case with single value range", () => {
      const min = 5, max = 5;
      
      expect(clampValue(0, min, max)).toBe(5);
      expect(clampValue(10, min, max)).toBe(5);
      expect(isIncrementDisabled(5, max)).toBe(true);
      expect(isDecrementDisabled(5, min)).toBe(true);
    });
  });
});