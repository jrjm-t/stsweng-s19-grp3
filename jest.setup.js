// jest.setup.js
import { jest } from '@jest/globals';

// Mock html2pdf.js globally so tests don’t crash in Node
jest.unstable_mockModule('html2pdf.js', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    save: jest.fn(),
  })),
}));

// Provide fallback env values for tests (override with real test values if needed)
process.env.SUPABASE_URL = process.env.SUPABASE_URL || "http://localhost:8000";
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "test-anon-key";