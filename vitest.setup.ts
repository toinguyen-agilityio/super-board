import { afterEach } from "vitest";

// The editor saves a draft to localStorage; keep it from leaking between tests.
afterEach(() => localStorage.clear());
