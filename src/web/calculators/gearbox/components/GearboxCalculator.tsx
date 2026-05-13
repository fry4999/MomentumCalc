import SimpleHeading from "common/components/heading/SimpleHeading";
import SingleInputLine from "common/components/io/inputs/SingleInputLine";
import { NumberInput } from "common/components/io/new/inputs";
import GenericSelect from "common/components/io/new/inputs/L3/GenericSelect";
import NumericOutput from "common/components/io/outputs/NumberOutput";
import { Column, Columns, Divider } from "common/components/styling/Building";
import { useGettersSetters } from "common/tooling/conversion";
import { useMemo } from "react";
import gearboxConfig, {
  GearboxParamsV1,
  GearboxStateV1,
} from "web/calculators/gearbox";
import { GearboxState } from "web/calculators/gearbox/converter";
import {
  GEARBOX_MOTORS,
  GearboxRecommendation,
  calculateGearboxRecommendations,
  calculateMechanismOutputs,
  calculateSelectedGearbox,
  findGearboxMotor,
} from "web/calculators/gearbox/math";

const motorChoices = GEARBOX_MOTORS.filter(
  (motor) => motor.integratedGearbox !== true,
).map((motor) => motor.name);

const NO_QUIPS = [
  "Ain't gonna happen",
  "Nope",
  "Won't work",
  "Infinity",
  "Fat Chance",
  "Not in this lifetime",
  "Yeah, keep dreaming",
  "When pigs fly",
  "Sure, in another universe",
  "Not in a million",
  "Right after never",
  "I'll hold my breath",
  "In your wildest dreams",
  "On a cold sun",
  "Maybe when I’m 100",
  "My calendar says no",
  "Try again next century",
  "Only if cows dance",
  "When turtles run marathons",
  "As likely as unicorns",
  "No bueno",
];

function fixed(value: number, digits: number): string {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return value.toFixed(digits);
}

function quipForSeed(seed: string): string {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return NO_QUIPS[hash % NO_QUIPS.length];
}

function StatusBadge(props: { pass: boolean; seed: string }): JSX.Element {
  const label = props.pass ? "YES" : quipForSeed(props.seed);

  return (
    <span
      className={[
        "gearbox-status",
        props.pass ? "gearbox-status--pass" : "gearbox-status--fail",
      ].join(" ")}
      title={props.pass ? "Yes" : "No"}
    >
      {label}
    </span>
  );
}

function RecommendationRow(props: {
  recommendation: GearboxRecommendation;
}): JSX.Element {
  const { recommendation } = props;

  return (
    <tr>
      <td>
        <span className="gearbox-motor-name">
          {recommendation.motor.name}
          {recommendation.motor.integratedGearbox ? (
            <span className="gearbox-integrated-badge">1:1</span>
          ) : null}
        </span>
      </td>
      <td>{fixed(recommendation.safeRatio, 2)}</td>
      <td>{fixed(recommendation.safeSweepSeconds, 3)}</td>
      <td>{fixed(recommendation.nominalRatio, 2)}</td>
      <td>{fixed(recommendation.nominalSweepSeconds, 3)}</td>
      <td>{fixed(recommendation.targetSpeedRatio, 2)}</td>
      <td>{fixed(recommendation.safeTorqueAtTargetRatioNm, 2)}</td>
      <td>{fixed(recommendation.nominalTorqueAtTargetRatioNm, 2)}</td>
      <td>{fixed(recommendation.maxTorqueAtTargetRatioNm, 2)}</td>
    </tr>
  );
}

export default function GearboxCalculator(): JSX.Element {
  const [get, set] = useGettersSetters(
    GearboxState.getState() as GearboxStateV1,
  );
  const motor = findGearboxMotor(get.selectedMotor);
  const mechanism = useMemo(() => calculateMechanismOutputs(get), [get]);
  const selected = useMemo(() => calculateSelectedGearbox(get), [get]);
  const recommendations = useMemo(
    () => calculateGearboxRecommendations(get),
    [get],
  );
  const statusSeed = [
    get.selectedMotor,
    get.gearRatio,
    mechanism.nominalTorqueNm,
    selected.loadedOutputSpeedRpm,
  ].join("|");

  return (
    <>
      <SimpleHeading
        queryParams={GearboxParamsV1}
        state={get}
        title={gearboxConfig.title}
      />

      <Columns desktop>
        <Column>
          <Divider>Mechanism</Divider>
          <SingleInputLine label="Nominal Load (lb)" id="loadLbs">
            <NumberInput
              dangerIf={() => get.loadLbs < 0}
              stateHook={[get.loadLbs, set.setLoadLbs]}
              step={0.1}
            />
          </SingleInputLine>
          <SingleInputLine label="Arm Length (in)" id="armLengthIn">
            <NumberInput
              dangerIf={() => get.armLengthIn <= 0}
              stateHook={[get.armLengthIn, set.setArmLengthIn]}
              step={0.1}
            />
          </SingleInputLine>
          <SingleInputLine
            label="90 Degree Sweep Time (s)"
            id="desiredSweepSeconds"
          >
            <NumberInput
              dangerIf={() => get.desiredSweepSeconds <= 0}
              stateHook={[get.desiredSweepSeconds, set.setDesiredSweepSeconds]}
              step={0.01}
            />
          </SingleInputLine>
          <SingleInputLine
            label="Spring Preload (in-lbf)"
            id="springPreloadInLb"
          >
            <NumberInput
              stateHook={[get.springPreloadInLb, set.setSpringPreloadInLb]}
              step={0.1}
            />
          </SingleInputLine>

          <Divider>Torque Limits</Divider>
          <SingleInputLine
            label="Safe Holding Torque (%)"
            id="safeHoldingTorquePercent"
          >
            <NumberInput
              dangerIf={() => get.safeHoldingTorquePercent <= 0}
              stateHook={[
                get.safeHoldingTorquePercent,
                set.setSafeHoldingTorquePercent,
              ]}
              step={1}
            />
          </SingleInputLine>
          <SingleInputLine
            label="Nominal Working Torque (%)"
            id="nominalWorkingTorquePercent"
          >
            <NumberInput
              dangerIf={() => get.nominalWorkingTorquePercent <= 0}
              stateHook={[
                get.nominalWorkingTorquePercent,
                set.setNominalWorkingTorquePercent,
              ]}
              step={1}
            />
          </SingleInputLine>
          <SingleInputLine
            label="Max Working Torque (%)"
            id="maxWorkingTorquePercent"
          >
            <NumberInput
              dangerIf={() => get.maxWorkingTorquePercent <= 0}
              stateHook={[
                get.maxWorkingTorquePercent,
                set.setMaxWorkingTorquePercent,
              ]}
              step={1}
            />
          </SingleInputLine>
        </Column>

        <Column>
          <Divider>Mechanism Load</Divider>
          <SingleInputLine
            label="Nominal Torque (in-lb)"
            id="nominalTorqueInLb"
          >
            <NumericOutput
              roundTo={2}
              stateHook={[mechanism.nominalTorqueInLb, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Nominal Torque (Nm)" id="nominalTorqueNm">
            <NumericOutput
              roundTo={3}
              stateHook={[mechanism.nominalTorqueNm, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Nominal Speed (rpm)" id="nominalSpeedRpm">
            <NumericOutput
              roundTo={1}
              stateHook={[mechanism.nominalSpeedRpm, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Nominal Power (W)" id="nominalPowerW">
            <NumericOutput
              roundTo={1}
              stateHook={[mechanism.nominalPowerW, () => undefined]}
            />
          </SingleInputLine>

          <Divider>Selected Gearbox</Divider>
          <SingleInputLine label="Motor" id="selectedMotor">
            <GenericSelect
              choices={motorChoices}
              fromString={(value) => value}
              makeString={(value) => value}
              stateHook={[get.selectedMotor, set.setSelectedMotor]}
            />
          </SingleInputLine>
          <SingleInputLine label="Gear Ratio" id="gearRatio">
            <NumberInput
              dangerIf={() => get.gearRatio <= 0}
              disabledIf={() => motor.integratedGearbox === true}
              stateHook={[get.gearRatio, set.setGearRatio]}
              step={0.1}
            />
          </SingleInputLine>
          <SingleInputLine label="Stall Torque (Nm)" id="selectedStallTorque">
            <NumericOutput
              roundTo={2}
              stateHook={[selected.motor.stallTorqueNm, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Free Speed (rpm)" id="selectedFreeSpeed">
            <NumericOutput
              roundTo={0}
              stateHook={[selected.motor.freeSpeedRpm, () => undefined]}
            />
          </SingleInputLine>
        </Column>

        <Column>
          <Divider>Selected Results</Divider>
          <SingleInputLine label="Strong Enough to Hold" id="safeHoldPass">
            <StatusBadge
              pass={selected.safeHoldPass}
              seed={`hold|${statusSeed}`}
            />
          </SingleInputLine>
          <SingleInputLine
            label="Strong Enough to Operate"
            id="nominalOperationPass"
          >
            <StatusBadge
              pass={selected.nominalOperationPass}
              seed={`operate|${statusSeed}`}
            />
          </SingleInputLine>
          <SingleInputLine label="Max Safe Torque (Nm)" id="maxSafeTorqueNm">
            <NumericOutput
              roundTo={2}
              stateHook={[selected.maxSafeTorqueNm, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine
            label="Max Nominal Torque (Nm)"
            id="maxNominalTorqueNm"
          >
            <NumericOutput
              roundTo={2}
              stateHook={[selected.maxNominalTorqueNm, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine
            label="Max Working Torque (Nm)"
            id="maxWorkingTorqueNm"
          >
            <NumericOutput
              roundTo={2}
              stateHook={[selected.maxWorkingTorqueNm, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Loaded Speed (rpm)" id="loadedOutputSpeedRpm">
            <NumericOutput
              dangerIf={() => selected.loadedOutputSpeedRpm <= 0}
              roundTo={1}
              stateHook={[selected.loadedOutputSpeedRpm, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine
            label="90 Degree Sweep Time (s)"
            id="loadedSweepTime"
          >
            <NumericOutput
              dangerIf={() => selected.loadedSweepSeconds <= 0}
              roundTo={3}
              stateHook={[selected.loadedSweepSeconds, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Hold Current (A)" id="holdCurrentA">
            <NumericOutput
              roundTo={2}
              stateHook={[selected.holdCurrentA, () => undefined]}
            />
          </SingleInputLine>
          <SingleInputLine label="Static Hold Voltage (V)" id="holdVoltageV">
            <NumericOutput
              roundTo={2}
              stateHook={[selected.holdVoltageV, () => undefined]}
            />
          </SingleInputLine>
        </Column>
      </Columns>

      <Divider>Motor Ratio Suggestions</Divider>
      <div className="table-container gearbox-table">
        <table className="table is-fullwidth is-narrow is-hoverable">
          <thead>
            <tr>
              <th>Motor</th>
              <th>Safe Ratio</th>
              <th>Safe Time</th>
              <th>Working Ratio</th>
              <th>Working Time</th>
              <th>Speed Ratio</th>
              <th>Safe Nm</th>
              <th>Working Nm</th>
              <th>Max Nm</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((recommendation) => (
              <RecommendationRow
                key={recommendation.motor.name}
                recommendation={recommendation}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
