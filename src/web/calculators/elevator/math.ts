export type ElevatorRiggingType = "Cascade" | "Continuous";

export type GearboxStage = {
  outputGear: number;
  inputGear: number;
};

export type ElevatorInputs = {
  freeSpeedRpm: number;
  stallTorqueNm: number;
  stallCurrentAmps: number;
  freeCurrentAmps: number;
  motorCount: number;
  efficiency: number;
  riggingType: ElevatorRiggingType;
  elevatorStages: number;
  travelDistanceIn: number;
  spoolDiameterIn: number;
  carriageWeightLbs: number;
  payloadWeightLbs: number;
  gearboxStages: GearboxStage[];
};

export type ElevatorResults = {
  mechanicalAdvantage: number;
  gearRatio: number;
  totalWeightLbs: number;
  effectiveLoadLbs: number;
  spoolStallForceLbs: number;
  stallLoadLbs: number;
  stringSpeedNoLoadInPerSec: number;
  linearSpeedNoLoadInPerSec: number;
  linearSpeedLoadedInPerSec: number;
  timeToExtendNoLoadSec: number;
  timeToExtendLoadedSec: number;
  currentDrawPerMotorAmps: number;
  factorOfSafety: number;
};

const NM_TO_LB_IN = 0.2248 * 39.37;

export function isElevatorRiggingType(
  riggingType: string,
): riggingType is ElevatorRiggingType {
  return riggingType === "Cascade" || riggingType === "Continuous";
}

export function clampWholeNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function calculateElevatorStageTravel(
  riggingType: ElevatorRiggingType,
  stageIndex: number,
  stageCount: number,
  extensionPercent: number,
): number {
  const extensionProgress = clamp01(extensionPercent / 100);

  if (riggingType === "Cascade") {
    return stageIndex * extensionProgress;
  }

  const segment = 1 / stageCount;
  let stageTravel = 0;

  for (let segmentIndex = 1; segmentIndex <= stageIndex; segmentIndex++) {
    stageTravel += clamp01(
      (extensionProgress - (segmentIndex - 1) * segment) / segment,
    );
  }

  return stageTravel;
}

export function calculateGearboxRatio(stages: GearboxStage[]): number {
  return stages.reduce((ratio, stage) => {
    if (stage.inputGear <= 0 || stage.outputGear <= 0) {
      return ratio;
    }

    return ratio * (stage.outputGear / stage.inputGear);
  }, 1);
}

function safeDivide(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
    return 0;
  }

  if (Math.abs(denominator) < Number.EPSILON) {
    return 0;
  }

  return numerator / denominator;
}

export function calculateElevator(inputs: ElevatorInputs): ElevatorResults {
  const gearRatio = calculateGearboxRatio(inputs.gearboxStages);
  const stageCount = clampWholeNumber(inputs.elevatorStages, 1, 4);
  const mechanicalAdvantage = inputs.riggingType === "Cascade" ? stageCount : 1;
  const totalWeightLbs = inputs.carriageWeightLbs + inputs.payloadWeightLbs;
  const effectiveLoadLbs = safeDivide(totalWeightLbs, mechanicalAdvantage);
  const spoolStallForceLbs = safeDivide(
    2 *
      inputs.stallTorqueNm *
      NM_TO_LB_IN *
      inputs.motorCount *
      gearRatio *
      inputs.efficiency,
    inputs.spoolDiameterIn,
  );
  const stallLoadLbs = spoolStallForceLbs * mechanicalAdvantage;
  const stringSpeedNoLoadInPerSec = safeDivide(
    inputs.freeSpeedRpm * inputs.spoolDiameterIn * Math.PI,
    60 * gearRatio,
  );
  const linearSpeedNoLoadInPerSec = safeDivide(
    stringSpeedNoLoadInPerSec,
    mechanicalAdvantage,
  );
  const loadedSpeedScale =
    spoolStallForceLbs <= 0
      ? 0
      : Math.max(0, 1 - effectiveLoadLbs / spoolStallForceLbs);
  const linearSpeedLoadedInPerSec =
    linearSpeedNoLoadInPerSec * loadedSpeedScale;
  const motorTorqueNeededNm = safeDivide(
    effectiveLoadLbs * (inputs.spoolDiameterIn / 2),
    NM_TO_LB_IN * gearRatio,
  );
  const currentDrawPerMotorAmps = safeDivide(
    safeDivide(
      inputs.stallCurrentAmps * inputs.motorCount -
        inputs.freeCurrentAmps * inputs.motorCount,
      inputs.stallTorqueNm * inputs.motorCount,
    ) *
      motorTorqueNeededNm +
      inputs.freeCurrentAmps * inputs.motorCount,
    inputs.motorCount,
  );

  return {
    mechanicalAdvantage,
    gearRatio,
    totalWeightLbs,
    effectiveLoadLbs,
    spoolStallForceLbs,
    stallLoadLbs,
    stringSpeedNoLoadInPerSec,
    linearSpeedNoLoadInPerSec,
    linearSpeedLoadedInPerSec,
    timeToExtendNoLoadSec: safeDivide(
      inputs.travelDistanceIn,
      linearSpeedNoLoadInPerSec,
    ),
    timeToExtendLoadedSec: safeDivide(
      inputs.travelDistanceIn,
      linearSpeedLoadedInPerSec,
    ),
    currentDrawPerMotorAmps,
    factorOfSafety: safeDivide(stallLoadLbs, totalWeightLbs),
  };
}
