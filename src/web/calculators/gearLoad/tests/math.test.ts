import { describe, expect, test } from "vitest";
import {
  calculateGearLoad,
  getLewisFormFactor,
} from "web/calculators/gearLoad/math";

describe("calculateGearLoad", () => {
  test("matches the reference gear load example", () => {
    const result = calculateGearLoad({
      material: "Steel",
      diametralPitch: 20,
      numTeeth: 20,
      faceWidth: 0.5,
      transmittedPower: 1,
      rpm: 1000,
      safetyFactor: 2,
    });

    expect(result.pitchDiameter).toBeCloseTo(1, 5);
    expect(result.pitchLineVelocity).toBeCloseTo(261.799, 3);
    expect(result.transmittedLoad).toBeCloseTo(126.051, 3);
    expect(result.dynamicFactor).toBeCloseTo(1.218, 3);
    expect(result.lewisY).toBeCloseTo(0.322, 5);
    expect(result.bendingStress).toBeCloseTo(19075, 0);
    expect(result.bendingSafetyFactor).toBeCloseTo(2.31, 2);
    expect(result.bendingPass).toBe(true);
  });

  test("uses the closest lower Lewis form factor", () => {
    expect(getLewisFormFactor(23)).toBeCloseTo(0.322, 5);
    expect(getLewisFormFactor(24)).toBeCloseTo(0.337, 5);
  });
});
