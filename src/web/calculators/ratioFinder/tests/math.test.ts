import { MotorBores } from "common/models/ExtraTypes";
import { Gearbox } from "common/models/Gearbox";
import { describe, expect, test } from "vitest";
import ratioFinderConfig, {
  RatioFinderStateV1,
} from "web/calculators/ratioFinder";
import { generateOptions } from "web/calculators/ratioFinder/math";

const defaultState: RatioFinderStateV1 = {
  targetReduction: 20,
  reductionError: 0.25,
  minStages: 1,
  maxStages: 2,
  startingBore: "SplineXS",
  forceStartingPinionSize: false,
  startingPinionSize: 14,
  printablePulleys: false,
  enableVPs: false,
  enableMPs: true,
  enableSports: true,
  enableGT2: false,
  enableHTD: true,
  enableRT25: true,
  minPulleyTeeth: 8,
  maxPulleyTeeth: 84,
  enable25Chain: true,
  enable35Chain: true,
  minSprocketTeeth: 8,
  maxSprocketTeeth: 84,
  enable20DPGears: true,
  enable32DPGears: false,
  minGearTeeth: 6,
  maxGearTeeth: 84,
  enableNEOPinions: true,
  enableFalconPinions: true,
  enable775Pinions: true,
  enable550Pinions: true,
  enableKrakenPinions: true,
  enableVortexPinions: true,
  enableVEX: false,
  enableREV: true,
  enableWCP: true,
  enableAM: true,
  enableTTB: true,
  enable12HexBore: true,
  enable38HexBore: false,
  enableBearingBore: false,
  enable875Bore: false,
  enableMaxSpline: true,
  enableSplineXL: true,
};

describe("ratio finder", () => {
  test("is no longer labeled as WIP", () => {
    expect(ratioFinderConfig.title).toBe("Ratio Finder");
    expect(ratioFinderConfig.description).not.toMatch(/WIP/i);
  });

  test("finds sorted real-part options for the beta-style defaults", () => {
    const result = generateOptions(defaultState, 10);
    const gearboxes = result.options.map((option) => Gearbox.fromObj(option));

    expect(result.count).toBeGreaterThan(0);
    expect(gearboxes.length).toBeGreaterThan(0);
    expect(gearboxes.length).toBeLessThanOrEqual(10);

    gearboxes.forEach((gearbox) => {
      expect(
        Math.abs(gearbox.getRatio() - defaultState.targetReduction),
      ).toBeLessThanOrEqual(defaultState.reductionError);
      expect(
        gearbox.stages[0].drivingMethods.some(
          (method) => method.bore === defaultState.startingBore,
        ),
      ).toBe(true);
      gearbox.stages.slice(1).forEach((stage) => {
        expect(
          stage.drivingMethods.some(
            (method) => !MotorBores.includes(method.bore),
          ),
        ).toBe(true);
      });
    });

    for (let i = 1; i < gearboxes.length; i++) {
      const previousError = Math.abs(
        gearboxes[i - 1].getRatio() - defaultState.targetReduction,
      );
      const currentError = Math.abs(
        gearboxes[i].getRatio() - defaultState.targetReduction,
      );

      expect(previousError).toBeLessThanOrEqual(currentError);
    }
  });

  test("respects the display limit while keeping the full count", () => {
    const result = generateOptions(defaultState, 3);

    expect(result.options.length).toBe(3);
    expect(result.count).toBeGreaterThan(result.options.length);
  });
});
