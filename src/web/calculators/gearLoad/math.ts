export type GearMaterial =
  | "Steel"
  | "Cast Iron"
  | "Bronze"
  | "Nylon"
  | "Delrin";

export type GearMaterialSpec = {
  allowableBendingStress: number;
  allowableContactStress: number;
};

export const GEAR_MATERIALS: Record<GearMaterial, GearMaterialSpec> = {
  Steel: {
    allowableBendingStress: 44000,
    allowableContactStress: 150000,
  },
  "Cast Iron": {
    allowableBendingStress: 8500,
    allowableContactStress: 65000,
  },
  Bronze: {
    allowableBendingStress: 5700,
    allowableContactStress: 30000,
  },
  Nylon: {
    allowableBendingStress: 6000,
    allowableContactStress: 10000,
  },
  Delrin: {
    allowableBendingStress: 5500,
    allowableContactStress: 12000,
  },
};

const LEWIS_FORM_FACTORS: Record<number, number> = {
  12: 0.245,
  14: 0.276,
  16: 0.296,
  18: 0.309,
  20: 0.322,
  24: 0.337,
  28: 0.353,
  32: 0.361,
  36: 0.373,
  40: 0.389,
  50: 0.408,
  60: 0.422,
  75: 0.435,
  100: 0.447,
  150: 0.46,
  200: 0.474,
};

export type GearLoadInputs = {
  material: GearMaterial;
  diametralPitch: number;
  numTeeth: number;
  faceWidth: number;
  transmittedPower: number;
  rpm: number;
  safetyFactor: number;
};

export type GearLoadResults = {
  pitchDiameter: number;
  pitchLineVelocity: number;
  transmittedLoad: number;
  dynamicFactor: number;
  lewisY: number;
  bendingStress: number;
  bendingSafetyFactor: number;
  bendingPass: boolean;
};

export function isGearMaterial(material: string): material is GearMaterial {
  return material in GEAR_MATERIALS;
}

export function getLewisFormFactor(numTeeth: number): number {
  const teethOptions = Object.keys(LEWIS_FORM_FACTORS)
    .map(Number)
    .sort((a, b) => a - b);
  let closestTeeth = teethOptions[0];

  for (const teeth of teethOptions) {
    if (teeth > numTeeth) {
      break;
    }

    closestTeeth = teeth;
  }

  return LEWIS_FORM_FACTORS[closestTeeth];
}

export function calculateGearLoad(inputs: GearLoadInputs): GearLoadResults {
  const material = GEAR_MATERIALS[inputs.material];

  if (
    inputs.diametralPitch <= 0 ||
    inputs.numTeeth <= 0 ||
    inputs.faceWidth <= 0 ||
    inputs.transmittedPower <= 0 ||
    inputs.rpm <= 0
  ) {
    return {
      pitchDiameter: 0,
      pitchLineVelocity: 0,
      transmittedLoad: 0,
      dynamicFactor: 0,
      lewisY: 0,
      bendingStress: 0,
      bendingSafetyFactor: 0,
      bendingPass: false,
    };
  }

  const pitchDiameter = inputs.numTeeth / inputs.diametralPitch;
  const pitchLineVelocity = (Math.PI * pitchDiameter * inputs.rpm) / 12;
  const transmittedLoad = (33000 * inputs.transmittedPower) / pitchLineVelocity;
  const dynamicFactor = (1200 + pitchLineVelocity) / 1200;
  const lewisY = getLewisFormFactor(inputs.numTeeth);
  const bendingStress =
    (transmittedLoad * dynamicFactor * inputs.diametralPitch) /
    (inputs.faceWidth * lewisY);
  const bendingSafetyFactor = material.allowableBendingStress / bendingStress;

  return {
    pitchDiameter,
    pitchLineVelocity,
    transmittedLoad,
    dynamicFactor,
    lewisY,
    bendingStress,
    bendingSafetyFactor,
    bendingPass: bendingSafetyFactor >= inputs.safetyFactor,
  };
}
