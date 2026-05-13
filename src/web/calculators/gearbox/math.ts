import Motor from "common/models/Motor";

export type GearboxMotor = {
  name: string;
  stallTorqueNm: number;
  freeSpeedRpm: number;
  powerW: number;
  stallCurrentA: number;
  integratedGearbox?: boolean;
};

export type GearboxInputs = {
  loadLbs: number;
  armLengthIn: number;
  desiredSweepSeconds: number;
  springPreloadInLb: number;
  safeHoldingTorquePercent: number;
  nominalWorkingTorquePercent: number;
  maxWorkingTorquePercent: number;
  selectedMotor: string;
  gearRatio: number;
};

export type MechanismOutputs = {
  nominalTorqueInLb: number;
  nominalTorqueNm: number;
  nominalSpeedRpm: number;
  nominalPowerW: number;
};

export type GearboxRecommendation = {
  motor: GearboxMotor;
  safeHoldingTorqueNm: number;
  nominalWorkingTorqueNm: number;
  maxWorkingTorqueNm: number;
  safeRatio: number;
  safeSpeedRpm: number;
  safeSweepSeconds: number;
  nominalRatio: number;
  nominalSpeedRpm: number;
  nominalSweepSeconds: number;
  targetSpeedRatio: number;
  safeTorqueAtTargetRatioNm: number;
  nominalTorqueAtTargetRatioNm: number;
  maxTorqueAtTargetRatioNm: number;
};

export type SelectedGearboxOutputs = {
  motor: GearboxMotor;
  maxSafeTorqueNm: number;
  maxNominalTorqueNm: number;
  maxWorkingTorqueNm: number;
  safeHoldPass: boolean;
  nominalOperationPass: boolean;
  loadedOutputSpeedRpm: number;
  loadedSweepSeconds: number;
  holdCurrentA: number;
  holdVoltageV: number;
};

function gearboxMotorFromMotor(motor: Motor): GearboxMotor {
  return {
    name: motor.identifier,
    stallTorqueNm: motor.stallTorque.to("N*m").scalar,
    freeSpeedRpm: motor.freeSpeed.to("rpm").scalar,
    powerW: motor.maxPower.to("W").scalar,
    stallCurrentA: motor.stallCurrent.to("A").scalar,
  };
}

export const GEARBOX_MOTORS: GearboxMotor[] = Motor.getAllMotors().map(
  gearboxMotorFromMotor,
);

export const DEFAULT_GEARBOX_INPUTS: GearboxInputs = {
  loadLbs: 3,
  armLengthIn: 13,
  desiredSweepSeconds: 0.1,
  springPreloadInLb: 0,
  safeHoldingTorquePercent: 10,
  nominalWorkingTorquePercent: 25,
  maxWorkingTorquePercent: 50,
  selectedMotor: "NEO Vortex",
  gearRatio: 96,
};

function safeDivide(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
    return 0;
  }

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

function pct(percent: number): number {
  return percent / 100;
}

function sweepSecondsFromRpm(rpm: number): number {
  return rpm > 0 ? 60 / (rpm * 4) : 0;
}

function loadedSpeed(
  motor: GearboxMotor,
  ratio: number,
  loadTorqueNm: number,
): number {
  const gearedStallTorque = motor.stallTorqueNm * ratio;

  if (ratio <= 0 || gearedStallTorque <= loadTorqueNm) {
    return 0;
  }

  return (motor.freeSpeedRpm / ratio) * (1 - loadTorqueNm / gearedStallTorque);
}

export function findGearboxMotor(name: string): GearboxMotor {
  return (
    GEARBOX_MOTORS.find((motor) => motor.name === name) ?? GEARBOX_MOTORS[0]
  );
}

export function calculateMechanismOutputs(
  inputs: GearboxInputs,
): MechanismOutputs {
  const nominalTorqueInLb =
    inputs.loadLbs * inputs.armLengthIn - inputs.springPreloadInLb;
  const nominalTorqueNm = (nominalTorqueInLb * 1.3558179483) / 12;
  const nominalSpeedRpm =
    inputs.desiredSweepSeconds > 0 ? 60 / (inputs.desiredSweepSeconds * 4) : 0;
  const nominalPowerW =
    nominalSpeedRpm > 0 ? (nominalTorqueNm * nominalSpeedRpm) / 9.5488 : 0;

  return {
    nominalTorqueInLb,
    nominalTorqueNm,
    nominalSpeedRpm,
    nominalPowerW,
  };
}

export function calculateGearboxRecommendation(
  inputs: GearboxInputs,
  motor: GearboxMotor,
): GearboxRecommendation {
  const mechanism = calculateMechanismOutputs(inputs);
  const safePercent = pct(inputs.safeHoldingTorquePercent);
  const nominalPercent = pct(inputs.nominalWorkingTorquePercent);
  const maxPercent = pct(inputs.maxWorkingTorquePercent);
  const safeHoldingTorqueNm = motor.stallTorqueNm * safePercent;
  const nominalWorkingTorqueNm = motor.stallTorqueNm * nominalPercent;
  const maxWorkingTorqueNm = motor.stallTorqueNm * maxPercent;

  if (motor.integratedGearbox) {
    const speed = loadedSpeed(motor, 1, mechanism.nominalTorqueNm);

    return {
      motor,
      safeHoldingTorqueNm,
      nominalWorkingTorqueNm,
      maxWorkingTorqueNm,
      safeRatio: 1,
      safeSpeedRpm: speed,
      safeSweepSeconds: sweepSecondsFromRpm(speed),
      nominalRatio: 1,
      nominalSpeedRpm: speed,
      nominalSweepSeconds: sweepSecondsFromRpm(speed),
      targetSpeedRatio: 1,
      safeTorqueAtTargetRatioNm: safeHoldingTorqueNm,
      nominalTorqueAtTargetRatioNm: nominalWorkingTorqueNm,
      maxTorqueAtTargetRatioNm: maxWorkingTorqueNm,
    };
  }

  const safeRatio = safeDivide(mechanism.nominalTorqueNm, safeHoldingTorqueNm);
  const safeSpeedRpm =
    safeRatio > 0 ? ((1 - safePercent) * motor.freeSpeedRpm) / safeRatio : 0;
  const nominalRatio = safeDivide(
    mechanism.nominalTorqueNm,
    nominalWorkingTorqueNm,
  );
  const nominalSpeedRpm =
    nominalRatio > 0
      ? ((1 - nominalPercent) * motor.freeSpeedRpm) / nominalRatio
      : 0;
  const targetSpeedRatio =
    mechanism.nominalSpeedRpm > 0
      ? (motor.freeSpeedRpm * (1 - nominalPercent)) / mechanism.nominalSpeedRpm
      : 0;

  return {
    motor,
    safeHoldingTorqueNm,
    nominalWorkingTorqueNm,
    maxWorkingTorqueNm,
    safeRatio,
    safeSpeedRpm,
    safeSweepSeconds: sweepSecondsFromRpm(safeSpeedRpm),
    nominalRatio,
    nominalSpeedRpm,
    nominalSweepSeconds: sweepSecondsFromRpm(nominalSpeedRpm),
    targetSpeedRatio,
    safeTorqueAtTargetRatioNm: safeHoldingTorqueNm * targetSpeedRatio,
    nominalTorqueAtTargetRatioNm: nominalWorkingTorqueNm * targetSpeedRatio,
    maxTorqueAtTargetRatioNm: maxWorkingTorqueNm * targetSpeedRatio,
  };
}

export function calculateGearboxRecommendations(
  inputs: GearboxInputs,
): GearboxRecommendation[] {
  return GEARBOX_MOTORS.map((motor) =>
    calculateGearboxRecommendation(inputs, motor),
  );
}

export function calculateSelectedGearbox(
  inputs: GearboxInputs,
): SelectedGearboxOutputs {
  const mechanism = calculateMechanismOutputs(inputs);
  const motor = findGearboxMotor(inputs.selectedMotor);
  const ratio = Math.max(inputs.gearRatio, 0);
  const safePercent = pct(inputs.safeHoldingTorquePercent);
  const nominalPercent = pct(inputs.nominalWorkingTorquePercent);
  const maxPercent = pct(inputs.maxWorkingTorquePercent);
  const maxSafeTorqueNm = safePercent * ratio * motor.stallTorqueNm;
  const maxNominalTorqueNm = nominalPercent * ratio * motor.stallTorqueNm;
  const maxWorkingTorqueNm = maxPercent * ratio * motor.stallTorqueNm;
  const loadedOutputSpeedRpm = loadedSpeed(
    motor,
    ratio,
    mechanism.nominalTorqueNm,
  );
  const gearedStallTorqueNm = ratio * motor.stallTorqueNm;

  return {
    motor,
    maxSafeTorqueNm,
    maxNominalTorqueNm,
    maxWorkingTorqueNm,
    safeHoldPass: maxSafeTorqueNm > mechanism.nominalTorqueNm,
    nominalOperationPass: maxWorkingTorqueNm > mechanism.nominalTorqueNm,
    loadedOutputSpeedRpm,
    loadedSweepSeconds: sweepSecondsFromRpm(loadedOutputSpeedRpm),
    holdCurrentA: safeDivide(
      motor.stallCurrentA * mechanism.nominalTorqueNm,
      gearedStallTorqueNm,
    ),
    holdVoltageV: safeDivide(
      12 * mechanism.nominalTorqueNm,
      gearedStallTorqueNm,
    ),
  };
}
