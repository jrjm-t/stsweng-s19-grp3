// Unit tests for console utilities
import { colors, header, colored, bold, logger } from "../src/lib/utils/console.js";

// Mock console methods for testing
const originalConsole = { ...console };

beforeEach(() => {
  jest.clearAllMocks();
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  Object.assign(console, originalConsole);
});

describe("Console Utilities", () => {
  describe("colors object", () => {
    it("should contain all ANSI color codes", () => {
      expect(colors.reset).toBe('\x1b[0m');
      expect(colors.bright).toBe('\x1b[1m');
      expect(colors.dim).toBe('\x1b[2m');
      expect(colors.red).toBe('\x1b[31m');
      expect(colors.green).toBe('\x1b[32m');
      expect(colors.yellow).toBe('\x1b[33m');
      expect(colors.blue).toBe('\x1b[34m');
      expect(colors.magenta).toBe('\x1b[35m');
      expect(colors.cyan).toBe('\x1b[36m');
      expect(colors.white).toBe('\x1b[37m');
      expect(colors.gray).toBe('\x1b[90m');
    });
  });

  describe("header function", () => {
    it("should create colored header with default cyan color", () => {
      const result = header("TEST");
      expect(result).toBe(`${colors.cyan}${colors.bright}[TEST]${colors.reset}`);
    });

    it("should create colored header with custom color", () => {
      const result = header("ERROR", "red");
      expect(result).toBe(`${colors.red}${colors.bright}[ERROR]${colors.reset}`);
    });

    it("should handle empty text", () => {
      const result = header("");
      expect(result).toBe(`${colors.cyan}${colors.bright}[]${colors.reset}`);
    });

    it("should handle invalid color gracefully", () => {
      const result = header("TEST", "invalidcolor" as any);
      // Invalid color should use undefined, which becomes undefined in template
      expect(result).toContain("[TEST]");
      expect(result).toContain(colors.bright);
      expect(result).toContain(colors.reset);
    });
  });

  describe("colored function", () => {
    it("should wrap text with specified color", () => {
      const result = colored("Hello", "red");
      expect(result).toBe(`${colors.red}Hello${colors.reset}`);
    });

    it("should handle empty text", () => {
      const result = colored("", "blue");
      expect(result).toBe(`${colors.blue}${colors.reset}`);
    });

    it("should work with all available colors", () => {
      const colorNames = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray'];
      colorNames.forEach(color => {
        const result = colored("test", color);
        expect(result).toContain((colors as any)[color]);
        expect(result).toContain(colors.reset);
      });
    });
  });

  describe("bold function", () => {
    it("should make text bold", () => {
      const result = bold("Bold Text");
      expect(result).toBe(`${colors.bright}Bold Text${colors.reset}`);
    });

    it("should handle empty text", () => {
      const result = bold("");
      expect(result).toBe(`${colors.bright}${colors.reset}`);
    });
  });

  describe("logger object", () => {
    it("should log success messages", () => {
      logger.success("Operation completed");
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("[SUCCESS]")
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Operation completed")
      );
    });

    it("should log error messages to console.error", () => {
      logger.error("Something went wrong");
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR]")
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Something went wrong")
      );
    });

    it("should log warning messages to console.warn", () => {
      logger.warning("This is a warning");
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("[WARNING]")
      );
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("This is a warning")
      );
    });

    it("should log info messages", () => {
      logger.info("Information message");
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("[INFO]")
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Information message")
      );
    });

    it("should log specialized messages", () => {
      logger.test("test message");
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("[TEST]"));
      
      logger.setup("setup message");
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("[SETUP]"));
      
      logger.users("users message");
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("[USERS]"));
      
      logger.stock("stock message");
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("[STOCK]"));
      
      logger.transaction("transaction message");
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("[TRANSACTION]"));
      
      logger.check("check message");
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("[CHECK]"));
      
      logger.verify("verify message");  
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("[VERIFY]"));
      
      logger.failed("failed message");
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining("[FAILED]"));
    });

    it("should handle empty messages", () => {
      logger.info("");
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("[INFO]")
      );
    });
  });
});