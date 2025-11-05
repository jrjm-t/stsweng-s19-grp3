// Unit tests for validation utilities (inspired by db.api.ts validation functions)

// Helper functions (based on db.api.ts validation patterns)
const validateString = (value: any, name: string, required = true): string | null => {
  if (required && (typeof value !== "string" || value.trim().length === 0)) {
    throw new Error(`${name} is required and must be a non-empty string`);
  }
  if (!required && value !== undefined && (typeof value !== "string" || value.trim().length === 0)) {
    throw new Error(`${name} must be a non-empty string if provided`);
  }
  return value ? value.trim() : null;
};

const validateNumber = (
  value: any,
  name: string,
  opts: { min?: number; max?: number; integer?: boolean } = {},
  required = true
): number | null => {
  if (required && (typeof value !== "number" || isNaN(value))) {
    throw new Error(`${name} must be a number`);
  }
  if (!required && value !== undefined && (typeof value !== "number" || isNaN(value))) {
    throw new Error(`${name} must be a number`);
  }
  if (opts.integer && value !== undefined && !Number.isInteger(value)) {
    throw new Error(`${name} must be an integer`);
  }
  if (opts.min !== undefined && value !== undefined && value < opts.min) {
    throw new Error(`${name} must be >= ${opts.min}`);
  }
  if (opts.max !== undefined && value !== undefined && value > opts.max) {
    throw new Error(`${name} must be <= ${opts.max}`);
  }
  return value;
};

const validateEnum = <T extends string>(
  value: any,
  name: string,  
  allowed: readonly T[],
  required = true
): T | null => {
  if (required && !value) {
    throw new Error(`${name} is required`);
  }
  if (!required && value === undefined) {
    return null;
  }
  if (!allowed.includes(value)) {
    throw new Error(`${name} must be one of: ${allowed.join(", ")}`);
  }
  return value;
};

const validateDate = (value: any, name: string, required = true): Date | null => {
  if (required && !value) {
    throw new Error(`${name} is required`);
  }
  if (!required && value === undefined) {
    return null;
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`${name} must be a valid date`);
  }
  return date;
};

const validateArray = (
  value: any,
  name: string,
  opts: { minLength?: number; maxLength?: number } = {},
  required = true
): any[] | null => {
  if (required && !Array.isArray(value)) {
    throw new Error(`${name} must be an array`);
  }
  if (!required && value === undefined) {
    return null;
  }
  if (!Array.isArray(value)) {
    throw new Error(`${name} must be an array`);
  }
  if (opts.minLength !== undefined && value.length < opts.minLength) {
    throw new Error(`${name} must have at least ${opts.minLength} items`);
  }
  if (opts.maxLength !== undefined && value.length > opts.maxLength) {
    throw new Error(`${name} must have at most ${opts.maxLength} items`);
  }
  return value;
};

describe("Validation Utilities", () => {
  describe("validateString", () => {

    it("should accept valid strings", () => {
      expect(validateString("hello", "name")).toBe("hello");
      expect(validateString("  world  ", "name")).toBe("world"); // trims whitespace
    });

    it("should reject empty required strings", () => {
      expect(() => validateString("", "name")).toThrow("name is required");
      expect(() => validateString("   ", "name")).toThrow("name is required");
      expect(() => validateString(null, "name")).toThrow("name is required");
    });

    it("should handle optional strings", () => {
      expect(validateString(undefined, "name", false)).toBe(null);
      expect(validateString("value", "name", false)).toBe("value");
      // Empty string should still throw for optional if provided
      expect(() => validateString("", "name", false)).toThrow("must be a non-empty string if provided");
    });

    it("should reject non-string types", () => {
      expect(() => validateString(123, "name")).toThrow("must be a non-empty string");
      expect(() => validateString(true, "name")).toThrow("must be a non-empty string");
      expect(() => validateString([], "name")).toThrow("must be a non-empty string");
    });
  });

  describe("validateNumber", () => {

    it("should accept valid numbers", () => {
      expect(validateNumber(5, "count")).toBe(5);
      expect(validateNumber(3.14, "pi")).toBe(3.14);
      expect(validateNumber(0, "zero")).toBe(0);
    });

    it("should reject invalid numbers", () => {
      expect(() => validateNumber("abc", "count")).toThrow("count must be a number");
      expect(() => validateNumber(null, "count")).toThrow("count must be a number");
      expect(() => validateNumber(NaN, "count")).toThrow("count must be a number");
    });

    it("should handle optional numbers", () => {
      expect(validateNumber(undefined, "count", {}, false)).toBe(undefined);
      expect(validateNumber(5, "count", {}, false)).toBe(5);
    });

    it("should validate minimum values", () => {
      expect(validateNumber(5, "count", { min: 0 })).toBe(5);
      expect(() => validateNumber(-1, "count", { min: 0 })).toThrow("count must be >= 0");
    });

    it("should validate maximum values", () => {
      expect(validateNumber(5, "count", { max: 10 })).toBe(5);
      expect(() => validateNumber(15, "count", { max: 10 })).toThrow("count must be <= 10");
    });

    it("should validate integers", () => {
      expect(validateNumber(5, "count", { integer: true })).toBe(5);
      expect(() => validateNumber(5.5, "count", { integer: true })).toThrow("count must be an integer");
    });

    it("should combine all validations", () => {
      expect(validateNumber(5, "count", { min: 0, max: 10, integer: true })).toBe(5);
      expect(() => validateNumber(15.5, "count", { min: 0, max: 10, integer: true }))
        .toThrow("count must be an integer");
    });
  });

  describe("validateEnum", () => {

    it("should accept valid enum values", () => {
      const colors = ["red", "green", "blue"] as const;
      expect(validateEnum("red", "color", colors)).toBe("red");
      expect(validateEnum("blue", "color", colors)).toBe("blue");
    });

    it("should reject invalid enum values", () => {
      const colors = ["red", "green", "blue"] as const;
      expect(() => validateEnum("yellow", "color", colors))
        .toThrow("color must be one of: red, green, blue");
      expect(() => validateEnum("", "color", colors))
        .toThrow("color is required"); // Empty string is falsy, so it triggers required check
    });

    it("should handle optional enum values", () => {
      const colors = ["red", "green", "blue"] as const;
      expect(validateEnum(undefined, "color", colors, false)).toBe(null);
      expect(validateEnum("red", "color", colors, false)).toBe("red");
    });

    it("should handle empty enum arrays", () => {
      const empty = [] as const;
      expect(() => validateEnum("anything", "value", empty))
        .toThrow("value must be one of: ");
    });
  });

  describe("validateDate", () => {

    it("should accept valid date strings", () => {
      const date = validateDate("2024-12-31", "expiry");
      expect(date).toBeInstanceOf(Date);
      expect(date?.getFullYear()).toBe(2024);
    });

    it("should accept Date objects", () => {
      const inputDate = new Date("2024-12-31");
      const result = validateDate(inputDate, "expiry");
      expect(result).toBeInstanceOf(Date);
    });

    it("should reject invalid dates", () => {
      expect(() => validateDate("invalid-date", "expiry"))
        .toThrow("expiry must be a valid date");
      expect(() => validateDate("2024-13-01", "expiry"))
        .toThrow("expiry must be a valid date");
    });

    it("should handle optional dates", () => {
      expect(validateDate(undefined, "expiry", false)).toBe(null);
      expect(validateDate("2024-12-31", "expiry", false)).toBeInstanceOf(Date);
    });

    it("should handle edge cases", () => {
      expect(() => validateDate("", "expiry")).toThrow("expiry is required");
      expect(() => validateDate(null, "expiry")).toThrow("expiry is required");
    });
  });

  describe("validateArray", () => {

    it("should accept valid arrays", () => {
      expect(validateArray([1, 2, 3], "items")).toEqual([1, 2, 3]);
      expect(validateArray([], "items")).toEqual([]);
    });

    it("should reject non-arrays", () => {
      expect(() => validateArray("not-array", "items")).toThrow("items must be an array");
      expect(() => validateArray(123, "items")).toThrow("items must be an array");
      expect(() => validateArray(null, "items")).toThrow("items must be an array");
    });

    it("should validate minimum length", () => {
      expect(validateArray([1, 2], "items", { minLength: 2 })).toEqual([1, 2]);
      expect(() => validateArray([1], "items", { minLength: 2 }))
        .toThrow("items must have at least 2 items");
    });

    it("should validate maximum length", () => {
      expect(validateArray([1, 2], "items", { maxLength: 3 })).toEqual([1, 2]);
      expect(() => validateArray([1, 2, 3, 4], "items", { maxLength: 3 }))
        .toThrow("items must have at most 3 items");
    });

    it("should handle optional arrays", () => {
      expect(validateArray(undefined, "items", {}, false)).toBe(null);
      expect(validateArray([1, 2], "items", {}, false)).toEqual([1, 2]);
    });
  });

  describe("integration scenarios", () => {
    it("should validate complete user input", () => {
      // Simulate validating a form submission
      const input = {
        name: "  John Doe  ",
        age: 25,
        email: "john@example.com",
        role: "admin",
        items: [1, 2, 3]
      };

      expect(validateString(input.name, "name")).toBe("John Doe");
      expect(validateNumber(input.age, "age", { min: 0, max: 120, integer: true })).toBe(25);
      expect(validateString(input.email, "email")).toBe("john@example.com");
      expect(validateEnum(input.role, "role", ["admin", "user"])).toBe("admin");
      expect(validateArray(input.items, "items", { minLength: 1 })).toEqual([1, 2, 3]);
    });

    it("should handle validation errors gracefully", () => {
      const input = {
        name: "",
        age: -5,
        role: "invalid"
      };

      expect(() => validateString(input.name, "name")).toThrow("name is required");
      expect(() => validateNumber(input.age, "age", { min: 0 })).toThrow("age must be >= 0");
      expect(() => validateEnum(input.role, "role", ["admin", "user"])).toThrow("role must be one of");
    });
  });
});