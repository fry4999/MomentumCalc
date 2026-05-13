import SimpleHeading from "common/components/heading/SimpleHeading";
import SingleInputLine from "common/components/io/inputs/SingleInputLine";
import {
  MeasurementInput,
  MotorInput,
  NumberInput,
} from "common/components/io/new/inputs";
import GenericSelect from "common/components/io/new/inputs/L3/GenericSelect";
import NumericOutput from "common/components/io/outputs/NumberOutput";
import {
  Column,
  Columns,
  Divider,
  Message,
} from "common/components/styling/Building";
import { useGettersSetters } from "common/tooling/conversion";
import { useMemo } from "react";
import elevatorConfig, {
  ElevatorParamsV1,
  ElevatorStateV1,
} from "web/calculators/elevator";
import { ElevatorState } from "web/calculators/elevator/converter";
import {
  calculateElevator,
  calculateElevatorStageTravel,
  clampWholeNumber,
  isElevatorRiggingType,
} from "web/calculators/elevator/math";

const riggingChoices = ["Cascade", "Continuous"];
const brandBlue = "#05cdfd";
const stageColors = [brandBlue, "#35d8fd", "#67e2fe", "#98edfe"];

function ExtensionSlider(props: {
  expanded?: boolean;
  id?: string;
  numberId?: string;
  selectId?: string;
  setValue: (value: number) => void;
  value: number;
}): JSX.Element {
  const boundedValue = Math.min(100, Math.max(0, Math.round(props.value)));
  const updateValue = (value: string) => props.setValue(Number(value));

  return (
    <div className="elevator-extension-slider">
      <input
        aria-label="Extension percentage"
        className="elevator-extension-slider__range"
        id={props.id}
        max={100}
        min={0}
        onChange={(event) => updateValue(event.currentTarget.value)}
        onInput={(event) => updateValue(event.currentTarget.value)}
        step={1}
        style={{
          background: `linear-gradient(90deg, ${brandBlue} 0%, ${brandBlue} ${boundedValue}%, rgba(16, 31, 56, 0.14) ${boundedValue}%, rgba(16, 31, 56, 0.14) 100%)`,
        }}
        type="range"
        value={boundedValue}
      />
      <output className="elevator-extension-slider__value" htmlFor={props.id}>
        {boundedValue}%
      </output>
    </div>
  );
}

export default function ElevatorCalculator(): JSX.Element {
  const [get, set] = useGettersSetters(
    ElevatorState.getState() as ElevatorStateV1,
  );
  const riggingType = isElevatorRiggingType(get.riggingType)
    ? get.riggingType
    : "Cascade";
  const activeGearboxStages = clampWholeNumber(get.gearboxStages, 1, 4);
  const stageCount = clampWholeNumber(get.elevatorStages, 1, 4);
  const extensionPercent = Math.min(100, Math.max(0, get.extensionPercent));
  const stageInputs = [
    {
      inputGear: get.stage1InputGear,
      outputGear: get.stage1OutputGear,
      setInputGear: set.setStage1InputGear,
      setOutputGear: set.setStage1OutputGear,
    },
    {
      inputGear: get.stage2InputGear,
      outputGear: get.stage2OutputGear,
      setInputGear: set.setStage2InputGear,
      setOutputGear: set.setStage2OutputGear,
    },
    {
      inputGear: get.stage3InputGear,
      outputGear: get.stage3OutputGear,
      setInputGear: set.setStage3InputGear,
      setOutputGear: set.setStage3OutputGear,
    },
    {
      inputGear: get.stage4InputGear,
      outputGear: get.stage4OutputGear,
      setInputGear: set.setStage4InputGear,
      setOutputGear: set.setStage4OutputGear,
    },
  ];
  const activeStageInputs = stageInputs.slice(0, activeGearboxStages);

  const results = useMemo(
    () =>
      calculateElevator({
        freeSpeedRpm: get.motor.freeSpeed.to("rpm").scalar,
        stallTorqueNm: get.motor.stallTorque.to("N m").scalar,
        stallCurrentAmps: get.motor.stallCurrent.to("A").scalar,
        freeCurrentAmps: get.motor.freeCurrent.to("A").scalar,
        motorCount: get.motor.quantity,
        efficiency: get.efficiency / 100,
        riggingType,
        elevatorStages: stageCount,
        travelDistanceIn: get.travelDistance.to("in").scalar,
        spoolDiameterIn: get.spoolDiameter.to("in").scalar,
        carriageWeightLbs: get.carriageWeight.to("lbs").scalar,
        payloadWeightLbs: get.payloadWeight.to("lbs").scalar,
        gearboxStages: activeStageInputs,
      }),
    [
      get.motor,
      get.efficiency,
      riggingType,
      stageCount,
      get.travelDistance,
      get.spoolDiameter,
      get.carriageWeight,
      get.payloadWeight,
      activeStageInputs,
    ],
  );

  const stageRects = useMemo(() => {
    const svgBottom = 285;
    const usableHeight = 250;
    const gap = 6;
    const stageHeight = (usableHeight - gap * (stageCount - 1)) / stageCount;
    const travelPerStage = get.travelDistance.to("in").scalar / stageCount || 1;
    const scale = (stageHeight + gap) / travelPerStage;

    return Array.from({ length: stageCount }, (_, index) => {
      const width = 150 - 14 * index;
      const x = (200 - width) / 2;
      const yOffset =
        calculateElevatorStageTravel(
          riggingType,
          index,
          stageCount,
          extensionPercent,
        ) *
        travelPerStage *
        scale;

      return {
        x,
        y: svgBottom - stageHeight - yOffset,
        width,
        height: stageHeight,
        color: stageColors[index % stageColors.length],
        label: index === 0 ? "Base" : `Stage ${index}`,
      };
    });
  }, [extensionPercent, get.travelDistance, riggingType, stageCount]);

  const topStageRect = stageRects[stageRects.length - 1];
  const measurementY = topStageRect ? (285 + topStageRect.y) / 2 : 0;
  const currentExtensionIn =
    (get.travelDistance.to("in").scalar * extensionPercent) / 100;

  return (
    <>
      <SimpleHeading
        queryParams={ElevatorParamsV1}
        state={get}
        title={elevatorConfig.title}
      />

      <Columns desktop>
        <Column>
          <SingleInputLine label="Motor" id="motor">
            <MotorInput
              numberDelay={500}
              stateHook={[get.motor, set.setMotor]}
            />
          </SingleInputLine>
          <SingleInputLine label="Gearbox Efficiency (%)" id="efficiency">
            <NumberInput
              dangerIf={() => get.efficiency <= 0 || get.efficiency > 100}
              stateHook={[get.efficiency, set.setEfficiency]}
              step={1}
            />
          </SingleInputLine>
          <SingleInputLine label="Rigging Type" id="riggingType">
            <GenericSelect
              choices={riggingChoices}
              fromString={(value) => value}
              makeString={(value) => value}
              stateHook={[get.riggingType, set.setRiggingType]}
            />
          </SingleInputLine>
          <SingleInputLine label="# of Elevator Stages" id="elevatorStages">
            <NumberInput
              dangerIf={() => get.elevatorStages < 1 || get.elevatorStages > 4}
              stateHook={[get.elevatorStages, set.setElevatorStages]}
            />
          </SingleInputLine>
          <SingleInputLine label="Total Travel Distance" id="travelDistance">
            <MeasurementInput
              defaultUnit="in"
              numberDelay={500}
              stateHook={[get.travelDistance, set.setTravelDistance]}
            />
          </SingleInputLine>
          <SingleInputLine label="Spool/Drum Diameter" id="spoolDiameter">
            <MeasurementInput
              defaultUnit="in"
              numberDelay={500}
              stateHook={[get.spoolDiameter, set.setSpoolDiameter]}
            />
          </SingleInputLine>
          <SingleInputLine label="Carriage + Stage Weight" id="carriageWeight">
            <MeasurementInput
              defaultUnit="lbs"
              numberDelay={500}
              stateHook={[get.carriageWeight, set.setCarriageWeight]}
            />
          </SingleInputLine>
          <SingleInputLine label="Payload Weight" id="payloadWeight">
            <MeasurementInput
              defaultUnit="lbs"
              numberDelay={500}
              stateHook={[get.payloadWeight, set.setPayloadWeight]}
            />
          </SingleInputLine>

          <Divider>Gearbox Stages</Divider>
          <SingleInputLine label="# of Gearbox Stages" id="gearboxStages">
            <NumberInput
              dangerIf={() => get.gearboxStages < 1 || get.gearboxStages > 4}
              stateHook={[get.gearboxStages, set.setGearboxStages]}
            />
          </SingleInputLine>

          {activeStageInputs.map((stage, index) => (
            <div className="mechanism-stage-group" key={index}>
              <Divider>Stage {index + 1}</Divider>
              <SingleInputLine
                label="Output Gear (Driven)"
                id={`stage${index + 1}OutputGear`}
              >
                <NumberInput
                  dangerIf={() => stage.outputGear <= 0}
                  stateHook={[stage.outputGear, stage.setOutputGear]}
                />
              </SingleInputLine>
              <SingleInputLine
                label="Input Gear (Driving)"
                id={`stage${index + 1}InputGear`}
              >
                <NumberInput
                  dangerIf={() => stage.inputGear <= 0}
                  stateHook={[stage.inputGear, stage.setInputGear]}
                />
              </SingleInputLine>
            </div>
          ))}
        </Column>

        <Column>
          {results.factorOfSafety > 0 && results.factorOfSafety < 1 && (
            <Message color="warning">
              Factor of safety is less than 1. The elevator cannot lift this
              load.
            </Message>
          )}

          <Divider>Elevator Visualization</Divider>
          <SingleInputLine label="Extension" id="extensionPercent">
            <ExtensionSlider
              setValue={set.setExtensionPercent}
              value={extensionPercent}
            />
          </SingleInputLine>
          <svg
            className="elevator-visualization"
            viewBox="0 0 200 300"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="6" y="15" width="4" height="270" rx="2" />
            <rect x="190" y="15" width="4" height="270" rx="2" />
            <line x1="6" y1="285" x2="194" y2="285" />
            {stageRects.map((stage) => (
              <g key={stage.label}>
                <rect
                  className="elevator-visualization__stage"
                  height={stage.height}
                  rx="3"
                  style={{ fill: stage.color }}
                  width={stage.width}
                  x={stage.x}
                  y={stage.y}
                />
                <text x="100" y={stage.y + stage.height - 10}>
                  {stage.label}
                </text>
              </g>
            ))}
            {stageRects.length > 0 && (
              <>
                <line
                  className="elevator-visualization__measure"
                  x1="186"
                  x2="186"
                  y1="285"
                  y2={topStageRect.y}
                />
                <line
                  className="elevator-visualization__measure"
                  x1="181"
                  x2="191"
                  y1="285"
                  y2="285"
                />
                <line
                  className="elevator-visualization__measure"
                  x1="181"
                  x2="191"
                  y1={topStageRect.y}
                  y2={topStageRect.y}
                />
                <rect
                  className="elevator-visualization__measurement-badge"
                  height="18"
                  rx="4"
                  width="32"
                  x="170"
                  y={measurementY - 10}
                />
                <text
                  className="elevator-visualization__measurement"
                  x="186"
                  y={measurementY + 4}
                >
                  {currentExtensionIn.toFixed(0)}
                  &quot;
                </text>
              </>
            )}
          </svg>

          <Divider>Results</Divider>
          <SingleInputLine label="No Load Speed (in/sec)" id="noLoadSpeed">
            <NumericOutput
              roundTo={2}
              stateHook={[results.linearSpeedNoLoadInPerSec, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="No Load Time (sec)" id="noLoadTime">
            <NumericOutput
              roundTo={2}
              stateHook={[results.timeToExtendNoLoadSec, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Loaded Speed (in/sec)" id="loadedSpeed">
            <NumericOutput
              dangerIf={() =>
                results.factorOfSafety > 0 && results.factorOfSafety < 1
              }
              roundTo={2}
              stateHook={[results.linearSpeedLoadedInPerSec, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Loaded Time (sec)" id="loadedTime">
            <NumericOutput
              dangerIf={() =>
                results.factorOfSafety > 0 && results.factorOfSafety < 1
              }
              roundTo={2}
              stateHook={[results.timeToExtendLoadedSec, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine
            label="Mechanical Advantage"
            id="mechanicalAdvantage"
          >
            <NumericOutput
              roundTo={2}
              stateHook={[results.mechanicalAdvantage, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Overall Gear Ratio" id="gearRatio">
            <NumericOutput
              roundTo={2}
              stateHook={[results.gearRatio, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Stall Load (lbs)" id="stallLoad">
            <NumericOutput
              roundTo={2}
              stateHook={[results.stallLoadLbs, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine
            label="Current Draw per Motor (amps)"
            id="currentDrawPerMotor"
          >
            <NumericOutput
              roundTo={2}
              stateHook={[results.currentDrawPerMotorAmps, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Factor of Safety" id="factorOfSafety">
            <NumericOutput
              dangerIf={() =>
                results.factorOfSafety > 0 && results.factorOfSafety < 1
              }
              roundTo={2}
              stateHook={[results.factorOfSafety, () => undefined]}
              successIf={() => results.factorOfSafety >= 1}
            />
          </SingleInputLine>
        </Column>
      </Columns>
    </>
  );
}
