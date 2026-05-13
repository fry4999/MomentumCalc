import SimpleHeading from "common/components/heading/SimpleHeading";
import SingleInputLine from "common/components/io/inputs/SingleInputLine";
import { NumberInput } from "common/components/io/new/inputs";
import GenericSelect from "common/components/io/new/inputs/L3/GenericSelect";
import NumericOutput from "common/components/io/outputs/NumberOutput";
import { Column, Columns, Divider } from "common/components/styling/Building";
import { useGettersSetters } from "common/tooling/conversion";
import { useMemo } from "react";
import gearLoadConfig, {
  GearLoadParamsV1,
  GearLoadStateV1,
} from "web/calculators/gearLoad";
import { GearLoadState } from "web/calculators/gearLoad/converter";
import {
  GEAR_MATERIALS,
  calculateGearLoad,
  isGearMaterial,
} from "web/calculators/gearLoad/math";

const materialChoices = Object.keys(GEAR_MATERIALS);

export default function GearLoadCalculator(): JSX.Element {
  const [get, set] = useGettersSetters(
    GearLoadState.getState() as GearLoadStateV1,
  );

  const material = isGearMaterial(get.material) ? get.material : "Steel";
  const results = useMemo(
    () =>
      calculateGearLoad({
        material,
        diametralPitch: get.diametralPitch,
        numTeeth: get.numTeeth,
        faceWidth: get.faceWidth,
        transmittedPower: get.transmittedPower,
        rpm: get.rpm,
        safetyFactor: get.safetyFactor,
      }),
    [
      material,
      get.diametralPitch,
      get.numTeeth,
      get.faceWidth,
      get.transmittedPower,
      get.rpm,
      get.safetyFactor,
    ],
  );

  return (
    <>
      <SimpleHeading
        queryParams={GearLoadParamsV1}
        state={get}
        title={gearLoadConfig.title}
      />

      <Columns desktop>
        <Column>
          <SingleInputLine label="Gear Material" id="material">
            <GenericSelect
              choices={materialChoices}
              fromString={(value) => value}
              makeString={(value) => value}
              stateHook={[get.material, set.setMaterial]}
            />
          </SingleInputLine>
          <SingleInputLine label="Diametral Pitch" id="diametralPitch">
            <NumberInput
              dangerIf={() => get.diametralPitch <= 0}
              stateHook={[get.diametralPitch, set.setDiametralPitch]}
            />
          </SingleInputLine>
          <SingleInputLine label="Number of Teeth" id="numTeeth">
            <NumberInput
              dangerIf={() => get.numTeeth < 6}
              stateHook={[get.numTeeth, set.setNumTeeth]}
            />
          </SingleInputLine>
          <SingleInputLine label="Face Width (in)" id="faceWidth">
            <NumberInput
              dangerIf={() => get.faceWidth <= 0}
              stateHook={[get.faceWidth, set.setFaceWidth]}
              step={0.01}
            />
          </SingleInputLine>
          <SingleInputLine label="Transmitted Power (hp)" id="transmittedPower">
            <NumberInput
              dangerIf={() => get.transmittedPower <= 0}
              stateHook={[get.transmittedPower, set.setTransmittedPower]}
              step={0.01}
            />
          </SingleInputLine>
          <SingleInputLine label="RPM" id="rpm">
            <NumberInput
              dangerIf={() => get.rpm <= 0}
              stateHook={[get.rpm, set.setRpm]}
            />
          </SingleInputLine>
          <SingleInputLine label="Pressure Angle (deg)" id="pressureAngle">
            <NumberInput
              stateHook={[get.pressureAngle, set.setPressureAngle]}
            />
          </SingleInputLine>
          <SingleInputLine label="Required Safety Factor" id="safetyFactor">
            <NumberInput
              dangerIf={() => get.safetyFactor < 1}
              stateHook={[get.safetyFactor, set.setSafetyFactor]}
              step={0.1}
            />
          </SingleInputLine>
        </Column>

        <Column>
          <Divider>Results</Divider>
          <SingleInputLine label="Pitch Diameter (in)" id="pitchDiameter">
            <NumericOutput
              roundTo={3}
              stateHook={[results.pitchDiameter, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine
            label="Pitch Line Velocity (ft/min)"
            id="pitchLineVelocity"
          >
            <NumericOutput
              roundTo={1}
              stateHook={[results.pitchLineVelocity, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Transmitted Load (lbs)" id="transmittedLoad">
            <NumericOutput
              roundTo={2}
              stateHook={[results.transmittedLoad, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Dynamic Factor (Barth)" id="dynamicFactor">
            <NumericOutput
              roundTo={3}
              stateHook={[results.dynamicFactor, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Lewis Form Factor (Y)" id="lewisY">
            <NumericOutput
              roundTo={3}
              stateHook={[results.lewisY, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Bending Stress (psi)" id="bendingStress">
            <NumericOutput
              roundTo={0}
              stateHook={[results.bendingStress, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine
            label="Bending Safety Factor"
            id="bendingSafetyFactor"
          >
            <NumericOutput
              dangerIf={() => !results.bendingPass}
              roundTo={2}
              stateHook={[results.bendingSafetyFactor, () => undefined]}
              successIf={() => results.bendingPass}
            />
          </SingleInputLine>
        </Column>
      </Columns>
    </>
  );
}
