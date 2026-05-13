import { describe, expect, test } from "vitest";
import Motor from "common/models/Motor";
import {
  DEFAULT_GEARBOX_INPUTS,
  GEARBOX_MOTORS,
  calculateGearboxRecommendation,
  calculateMechanismOutputs,
  calculateSelectedGearbox,
  findGearboxMotor,
} from "web/calculators/gearbox/math";

describe("gearbox calculator", () => {
  test("uses the same motor list as the motors page", () => {
    expect(GEARBOX_MOTORS.map((motor) => motor.name)).toEqual(
      Motor.getAllChoices(),
    );
  });

  test("calculates default mechanism outputs", () => {
    const result = calculateMechanismOutputs(DEFAULT_GEARBOX_INPUTS);

    expect(result.nominalTorqueInLb).toBeCloseTo(39);
    expect(result.nominalTorqueNm).toBeCloseTo(4.406408332);
    expect(result.nominalSpeedRpm).toBeCloseTo(150);
    expect(result.nominalPowerW).toBeCloseTo(69.21929979);
  });

  test("calculates selected NEO Vortex outputs", () => {
    const result = calculateSelectedGearbox(DEFAULT_GEARBOX_INPUTS);

    expect(result.maxSafeTorqueNm).toBeCloseTo(57.1872);
    expect(result.maxNominalTorqueNm).toBeCloseTo(142.968);
    expect(result.maxWorkingTorqueNm).toBeCloseTo(285.936);
    expect(result.safeHoldPass).toBe(true);
    expect(result.nominalOperationPass).toBe(true);
    expect(result.loadedOutputSpeedRpm).toBeCloseTo(70.54595593);
    expect(result.loadedSweepSeconds).toBeCloseTo(0.2126273548);
    expect(result.holdCurrentA).toBeCloseTo(3.013448186);
    expect(result.holdVoltageV).toBeCloseTo(0.09246282382);
  });

  test("calculates NEO Vortex recommendation row", () => {
    const result = calculateGearboxRecommendation(
      DEFAULT_GEARBOX_INPUTS,
      findGearboxMotor("NEO Vortex"),
    );

    expect(result.safeRatio).toBeCloseTo(7.397025906);
    expect(result.safeSpeedRpm).toBeCloseTo(830.4013097);
    expect(result.safeSweepSeconds).toBeCloseTo(0.01806355533);
    expect(result.nominalRatio).toBeCloseTo(2.958810362);
    expect(result.nominalSpeedRpm).toBeCloseTo(1730.002729);
    expect(result.nominalSweepSeconds).toBeCloseTo(0.008670506556);
    expect(result.targetSpeedRatio).toBeCloseTo(34.125);
    expect(result.safeTorqueAtTargetRatioNm).toBeCloseTo(20.3282625);
    expect(result.nominalTorqueAtTargetRatioNm).toBeCloseTo(50.82065625);
    expect(result.maxTorqueAtTargetRatioNm).toBeCloseTo(101.6413125);
  });
});
