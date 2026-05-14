import {
  Bore,
  ChainType,
  FRCVendor,
  MotorBores,
  PulleyBeltType,
} from "common/models/ExtraTypes";
import {
  GearData,
  Gearbox,
  MotionMethod,
  MotionMethodPart,
  Planetary,
  PulleyData,
  RawPlanetaryData,
  SprocketData,
  Stage,
} from "common/models/Gearbox";
import { expose } from "common/tooling/promise-worker";
import { combinationsWithReplacement } from "common/tooling/util";
import { RatioFinderStateV1 } from "web/calculators/ratioFinder";

import max from "lodash/max";
import min from "lodash/min";

import amGears from "common/models/data/cots/andymark/gears.json";
import amPulleys from "common/models/data/cots/andymark/pulleys.json";
import amSprockets from "common/models/data/cots/andymark/sprockets.json";
import maxPlanetary from "common/models/data/cots/planetaries/maxplanetaries.json";
import sportPlanetary from "common/models/data/cots/planetaries/sports.json";
import versaPlanetary from "common/models/data/cots/planetaries/versaplanetaries.json";
import printedPulleys from "common/models/data/cots/printedPulleys.json";
import revGears from "common/models/data/cots/rev/gears.json";
import revPulleys from "common/models/data/cots/rev/pulleys.json";
import revSprockets from "common/models/data/cots/rev/sprockets.json";
import ttbPulleys from "common/models/data/cots/ttb/pulleys.json";
import ttbSprockets from "common/models/data/cots/ttb/sprockets.json";
import vexGears from "common/models/data/cots/vex/gears.json";
import vexPulleys from "common/models/data/cots/vex/pulleys.json";
import vexSprockets from "common/models/data/cots/vex/sprockets.json";
import wcpGears from "common/models/data/cots/wcp/gears.json";
import wcpPulleys from "common/models/data/cots/wcp/pulleys.json";
import wcpSprockets from "common/models/data/cots/wcp/sprockets.json";

type GearboxObj = ReturnType<Gearbox["toObj"]>;

export type RatioFinderSearchResult = {
  count: number;
  options: GearboxObj[];
};

const DEFAULT_RESULT_LIMIT = 50;

function stagesFromMinToMax(
  min: number,
  max: number,
  additionalStartingSizes: number[],
): Stage[] {
  const stages: Stage[] = [];
  for (let i = min; i <= max; i++) {
    for (let j = min; j <= max; j++) {
      if (i === j) {
        continue;
      }

      stages.push(new Stage(i, j, [], []));
    }
  }

  for (let i = 0; i < additionalStartingSizes.length; i++) {
    if (additionalStartingSizes[i] <= 0) {
      continue;
    }

    for (let j = min; j <= max; j++) {
      if (additionalStartingSizes[i] === j) {
        continue;
      }

      stages.push(new Stage(additionalStartingSizes[i], j, [], []));
    }
  }

  return stages;
}

export function allPossibleSingleGearStages(state: RatioFinderStateV1) {
  return stagesFromMinToMax(
    min([state.minGearTeeth, state.minPulleyTeeth, state.minSprocketTeeth]) ||
      8,
    max([state.maxGearTeeth, state.maxPulleyTeeth, state.maxSprocketTeeth]) ||
      84,
    state.forceStartingPinionSize ? [state.startingPinionSize] : [],
  );
}

export function allPossiblePlanetaryRatios(planetary: RawPlanetaryData): {
  [ratio: number]: number[][];
} {
  const ret: {
    [ratio: number]: number[][];
  } = {};
  for (let i = 1; i <= planetary.maxStages; i++) {
    [...combinationsWithReplacement(planetary.ratios, i)].forEach((arr) => {
      const ratio = arr.reduce((prev, curr) => prev * curr, 1);
      if (!(ratio in ret)) {
        ret[ratio] = [];
      }
      ret[ratio].push(arr);
    });
  }

  return ret;
}

export function generatePlanetaryStages(planetary: RawPlanetaryData) {
  const ratiosAndStages = allPossiblePlanetaryRatios(planetary);
  const planetaries: Planetary[] = [];
  Object.entries(ratiosAndStages).forEach(([ratio_, stages]) => {
    const ratio = Number(ratio_);
    planetaries.push(new Planetary(ratio, stages, planetary));
  });

  return planetaries;
}

export function linkOverlappingGearStages(
  stages: Stage[],
  motionMethods: MotionMethod[],
  state: RatioFinderStateV1,
) {
  motionMethods.forEach((gear) => {
    stages.forEach((stage) => {
      if (gear.teeth === stage.driven && !MotorBores.includes(gear.bore)) {
        stage.drivenMethods.push(gear);
      }

      if (gear.teeth === stage.driving) {
        stage.drivingMethods.push(gear);
      }
    });
  });
}

function filterGears(
  state: RatioFinderStateV1,
  gears: typeof revGears,
): GearData[] {
  return gears
    .map((g) => ({
      dp: g.dp,
      bore: g.bore as Bore,
      teeth: g.teeth,
      vendor: g.vendor as FRCVendor,
      partNumber: g.partNumber,
      url: g.url,
    }))
    .filter((g) => state.enable20DPGears || g.dp !== 20)
    .filter((g) => state.enable32DPGears || g.dp !== 32)
    .filter(
      (g) =>
        (state.forceStartingPinionSize &&
          g.teeth === state.startingPinionSize &&
          MotorBores.includes(g.bore)) ||
        (state.minGearTeeth <= g.teeth && state.maxGearTeeth >= g.teeth),
    );
}

function filterPulleys(
  state: RatioFinderStateV1,
  pulleys: typeof revPulleys,
): PulleyData[] {
  return pulleys
    .map((p) => ({
      bore: p.bore as Bore,
      teeth: p.teeth,
      vendor: p.vendor as FRCVendor,
      partNumber: p.partNumber,
      url: p.url,
      pitch: p.pitch,
      beltType: p.type as PulleyBeltType,
    }))
    .filter((p) => state.enableHTD || p.beltType !== "HTD")
    .filter((p) => state.enableGT2 || p.beltType !== "GT2")
    .filter((p) => state.enableRT25 || p.beltType !== "RT25")
    .filter(
      (g) =>
        (state.forceStartingPinionSize &&
          g.teeth === state.startingPinionSize &&
          MotorBores.includes(g.bore)) ||
        (state.minPulleyTeeth <= g.teeth && state.maxPulleyTeeth >= g.teeth),
    );
}
function filterSprockets(
  state: RatioFinderStateV1,
  sprockets: typeof revSprockets,
): SprocketData[] {
  return sprockets
    .map((s) => ({
      bore: s.bore as Bore,
      teeth: s.teeth,
      vendor: s.vendor as FRCVendor,
      partNumber: s.partNumber,
      url: s.url,
      chainType: s.type as ChainType,
    }))
    .filter((s) => state.enable25Chain || s.chainType !== "#25")
    .filter((s) => state.enable35Chain || s.chainType !== "#35")
    .filter(
      (g) =>
        (state.forceStartingPinionSize &&
          g.teeth === state.startingPinionSize &&
          MotorBores.includes(g.bore)) ||
        (state.minSprocketTeeth <= g.teeth &&
          state.maxSprocketTeeth >= g.teeth),
    );
}

function normalizedStageBounds(state: RatioFinderStateV1): {
  minStages: number;
  maxStages: number;
} {
  const rawMin = Number.isFinite(state.minStages) ? state.minStages : 1;
  const rawMax = Number.isFinite(state.maxStages) ? state.maxStages : 2;
  const minStages = Math.max(1, Math.floor(Math.min(rawMin, rawMax)));
  const maxStages = Math.min(
    2,
    Math.max(minStages, Math.floor(Math.max(rawMin, rawMax))),
  );

  return { minStages, maxStages };
}

function cloneStage(stage: Stage): Stage {
  return new Stage(
    stage.driving,
    stage.driven,
    [...stage.drivingMethods],
    [...stage.drivenMethods],
  );
}

function isRatioInRange(ratio: number, lower: number, upper: number): boolean {
  return ratio >= lower && ratio <= upper;
}

function lowerBound(
  ratios: { ratio: number; stage: Stage }[],
  target: number,
): number {
  let low = 0;
  let high = ratios.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);

    if (ratios[mid].ratio < target) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

function motionMethodScore(gearbox: Gearbox): number {
  return gearbox.stages.reduce(
    (total, stage) =>
      total + stage.drivingMethods.length + stage.drivenMethods.length,
    0,
  );
}

function compareGearboxes(targetReduction: number) {
  return (a: Gearbox, b: Gearbox): number =>
    Math.abs(a.getRatio() - targetReduction) -
      Math.abs(b.getRatio() - targetReduction) ||
    a.getStages() - b.getStages() ||
    motionMethodScore(b) - motionMethodScore(a) ||
    a.getMax() - b.getMax() ||
    a.getMin() - b.getMin();
}

function buildValidGearbox(
  stages: Stage[],
  state: RatioFinderStateV1,
): Gearbox | null {
  const gearbox = new Gearbox(stages.map(cloneStage));

  gearbox.filterStagesForOverlappingMotionMethods();
  gearbox.filterStagesForOverlappingBores();
  gearbox.filterStagesForOverlappingMotionMethods();
  gearbox.filterStagesForStartingBore(state.startingBore);

  if (
    gearbox.hasMotionModes() &&
    gearbox.startsWithBore(state.startingBore) &&
    (state.forceStartingPinionSize
      ? gearbox.startsWithTeeth(state.startingPinionSize)
      : true) &&
    !gearbox.containsPinionInBadPlace()
  ) {
    return gearbox;
  }

  return null;
}

function findGearboxOptions(
  stages: Stage[],
  state: RatioFinderStateV1,
): Gearbox[] {
  const { minStages, maxStages } = normalizedStageBounds(state);
  const targetReduction = Number.isFinite(state.targetReduction)
    ? Math.max(0, state.targetReduction)
    : 0;
  const reductionError = Number.isFinite(state.reductionError)
    ? Math.max(0, state.reductionError)
    : 0;
  const lowerRatio = targetReduction - reductionError;
  const upperRatio = targetReduction + reductionError;

  if (upperRatio <= 0) {
    return [];
  }

  const stageRatios = stages
    .map((stage) => ({ stage, ratio: stage.getRatio() }))
    .filter(({ ratio }) => Number.isFinite(ratio) && ratio > 0);
  const sortedStageRatios = [...stageRatios].sort((a, b) => a.ratio - b.ratio);
  const options: Gearbox[] = [];

  const addIfValid = (candidateStages: Stage[], ratio: number) => {
    if (!isRatioInRange(ratio, lowerRatio, upperRatio)) {
      return;
    }

    const gearbox = buildValidGearbox(candidateStages, state);
    if (gearbox !== null) {
      options.push(gearbox);
    }
  };

  if (minStages <= 1 && maxStages >= 1) {
    stageRatios.forEach(({ stage, ratio }) => {
      addIfValid([stage], ratio);
    });
  }

  if (minStages <= 2 && maxStages >= 2) {
    stageRatios.forEach((first) => {
      const minSecondRatio = lowerRatio / first.ratio;
      const maxSecondRatio = upperRatio / first.ratio;
      const startIndex = lowerBound(sortedStageRatios, minSecondRatio);

      for (let i = startIndex; i < sortedStageRatios.length; i++) {
        const second = sortedStageRatios[i];

        if (second.ratio > maxSecondRatio) {
          break;
        }

        addIfValid([first.stage, second.stage], first.ratio * second.ratio);
      }
    });
  }

  return options.sort(compareGearboxes(targetReduction));
}

export function generateOptions(
  state: RatioFinderStateV1,
  limit = DEFAULT_RESULT_LIMIT,
): RatioFinderSearchResult {
  let stages = allPossibleSingleGearStages(state);

  if (state.enableMPs && state.enableREV) {
    stages = stages.concat(
      generatePlanetaryStages({
        inputs: maxPlanetary.inputs as Bore[],
        maxStages: maxPlanetary.maxStages,
        outputs: maxPlanetary.outputs as Bore[],
        partNumber: maxPlanetary.partNumber,
        ratios: maxPlanetary.ratios,
        url: maxPlanetary.url,
        vendor: maxPlanetary.vendor as FRCVendor,
      }),
    );
  }
  if (state.enableVPs && state.enableVEX) {
    stages = stages.concat(
      generatePlanetaryStages({
        inputs: versaPlanetary.inputs as Bore[],
        maxStages: versaPlanetary.maxStages,
        outputs: versaPlanetary.outputs as Bore[],
        partNumber: versaPlanetary.partNumber,
        ratios: versaPlanetary.ratios,
        url: versaPlanetary.url,
        vendor: versaPlanetary.vendor as FRCVendor,
      }),
    );
  }
  if (state.enableSports && state.enableAM) {
    stages = stages.concat(
      generatePlanetaryStages({
        inputs: sportPlanetary.inputs as Bore[],
        maxStages: sportPlanetary.maxStages,
        outputs: sportPlanetary.outputs as Bore[],
        partNumber: sportPlanetary.partNumber,
        ratios: sportPlanetary.ratios,
        url: sportPlanetary.url,
        vendor: sportPlanetary.vendor as FRCVendor,
      }),
    );
  }

  const gears = [
    ...(state.enableREV ? revGears : []),
    ...(state.enableAM ? amGears : []),
    ...(state.enableWCP ? wcpGears : []),
    ...(state.enableTTB ? [] : []),
    ...(state.enableVEX ? vexGears : []),
  ];

  const pulleys = [
    ...(state.enableREV ? revPulleys : []),
    ...(state.enableAM ? amPulleys : []),
    ...(state.enableWCP ? wcpPulleys : []),
    ...(state.enableTTB ? ttbPulleys : []),
    ...(state.enableVEX ? vexPulleys : []),
    ...(state.printablePulleys ? printedPulleys : []),
  ];

  const sprockets = [
    ...(state.enableREV ? revSprockets : []),
    ...(state.enableAM ? amSprockets : []),
    ...(state.enableWCP ? wcpSprockets : []),
    ...(state.enableTTB ? ttbSprockets : []),
    ...(state.enableVEX ? vexSprockets : []),
  ];

  const motionMethods: MotionMethod[] = [
    ...filterGears(state, gears).map((g) => ({
      ...g,
      type: "Gear" as MotionMethodPart,
    })),
    ...filterPulleys(state, pulleys).map((g) => ({
      ...g,
      type: "Pulley" as MotionMethodPart,
    })),
    ...filterSprockets(state, sprockets).map((g) => ({
      ...g,
      type: "Sprocket" as MotionMethodPart,
    })),
  ]
    .filter((m) => state.enableREV || m.vendor !== "REV")
    .filter((m) => state.enableAM || m.vendor !== "AndyMark")
    .filter((m) => state.enableVEX || m.vendor !== "VEXpro")
    .filter((m) => state.enableWCP || m.vendor !== "WCP")
    .filter((m) => state.enableTTB || m.vendor !== "TTB")
    .filter((m) => state.printablePulleys || m.vendor !== "Printed")
    .filter((m) => {
      let good = true;
      if (MotorBores.includes(m.bore)) {
        good = good && (state.enableFalconPinions || m.bore !== "Falcon");
        good = good && (state.enableNEOPinions || m.bore !== "NEO");
        good = good && (state.enable775Pinions || m.bore !== "775");
        good = good && (state.enable550Pinions || m.bore !== "550");
        good = good && (state.enableKrakenPinions || m.bore !== "SplineXS");
        good = good && (state.enableVortexPinions || m.bore !== "Vortex");
      } else {
        good = good && (state.enable12HexBore || m.bore !== "1/2 Hex");
        good = good && (state.enable38HexBore || m.bore !== "3/8 Hex");
        good = good && (state.enable875Bore || m.bore !== "0.875in");
        good = good && (state.enableBearingBore || m.bore !== "1.125in");
        good = good && (state.enableMaxSpline || m.bore !== "MAXSpline");
        good = good && (state.enableSplineXL || m.bore !== "SplineXL");
      }
      return good;
    });

  linkOverlappingGearStages(stages, motionMethods, state);

  stages = stages
    .filter((stage) => stage.drivenMethods.length > 0)
    .filter((stage) => stage.drivingMethods.length > 0);

  const options = findGearboxOptions(stages, state);
  const safeLimit =
    Number.isFinite(limit) && limit > 0
      ? Math.max(1, Math.floor(limit))
      : DEFAULT_RESULT_LIMIT;

  return {
    count: options.length,
    options: options.slice(0, safeLimit).map((gb) => gb.toObj()),
  };
}

const workerFunctions = { generateOptions };
if (typeof WorkerGlobalScope !== "undefined") {
  expose(workerFunctions);
}
type RatioFinderWorkerFunctions = typeof workerFunctions;
export type { RatioFinderWorkerFunctions };
