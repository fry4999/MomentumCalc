import { describe, expect, test } from "vitest";
import {
  calculateElevator,
  calculateElevatorStageTravel,
  calculateGearboxRatio,
} from "web/calculators/elevator/math";

describe("calculateGearboxRatio", () => {
  test("multiplies active stage output over input", () => {
    expect(
      calculateGearboxRatio([
        { outputGear: 60, inputGear: 12 },
        { outputGear: 36, inputGear: 18 },
      ]),
    ).toBeCloseTo(10, 5);
  });
});

describe("calculateElevatorStageTravel", () => {
  test("extends continuous stages in separate slider segments", () => {
    expect(calculateElevatorStageTravel("Continuous", 1, 3, 20)).toBeCloseTo(
      0.6,
      5,
    );
    expect(calculateElevatorStageTravel("Continuous", 1, 3, 40)).toBeCloseTo(
      1,
      5,
    );
    expect(calculateElevatorStageTravel("Continuous", 2, 3, 40)).toBeCloseTo(
      1.2,
      5,
    );
    expect(calculateElevatorStageTravel("Continuous", 2, 3, 70)).toBeCloseTo(
      2,
      5,
    );
  });

  test("moves cascade stages together", () => {
    expect(calculateElevatorStageTravel("Cascade", 2, 3, 50)).toBeCloseTo(1, 5);
  });
});

describe("calculateElevator", () => {
  test("calculates cascade elevator outputs", () => {
    const result = calculateElevator({
      freeSpeedRpm: 6000,
      stallTorqueNm: 2,
      stallCurrentAmps: 300,
      freeCurrentAmps: 2,
      motorCount: 1,
      efficiency: 0.8,
      riggingType: "Cascade",
      elevatorStages: 2,
      travelDistanceIn: 48,
      spoolDiameterIn: 1.5,
      carriageWeightLbs: 15,
      payloadWeightLbs: 5,
      gearboxStages: [{ outputGear: 1, inputGear: 1 }],
    });

    expect(result.mechanicalAdvantage).toBe(2);
    expect(result.gearRatio).toBe(1);
    expect(result.stallLoadLbs).toBeCloseTo(37.76, 2);
    expect(result.linearSpeedNoLoadInPerSec).toBeCloseTo(235.62, 2);
    expect(result.timeToExtendNoLoadSec).toBeCloseTo(0.2, 2);
    expect(result.factorOfSafety).toBeCloseTo(1.89, 2);
  });
});
