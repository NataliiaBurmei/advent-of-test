const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "\\.fuzz\\.test\\."],
  verbose: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.test.ts", "!src/**/*.fuzz.test.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text", "clover"],
};