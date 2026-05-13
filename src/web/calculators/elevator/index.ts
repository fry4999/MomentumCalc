import { Stateify } from "common/models/ExtraTypes";
import Measurement from "common/models/Measurement";
import Motor from "common/models/Motor";
import PageConfig from "common/models/PageConfig";
import { MeasurementParam, MotorParam } from "common/models/Params";
import { lazy } from "react";
import { NumberParam, StringParam, withDefault } from "serialize-query-params";

const elevatorConfig: PageConfig = {
  url: "/elevator",
  title: "Elevator Calculator",
  description: "Multi-stage elevator calculator",
  image: "/media/Elevator",
  version: 1,
  component: lazy(
    () => import("web/calculators/elevator/components/ElevatorPage"),
  ),
};

export default elevatorConfig;

export const ElevatorParamsV1 = {
  motor: withDefault(MotorParam, Motor.KrakensWithFOC(1)),
  efficiency: withDefault(NumberParam, 80),
  riggingType: withDefault(StringParam, "Cascade"),
  elevatorStages: withDefault(NumberParam, 2),
  travelDistance: withDefault(MeasurementParam, new Measurement(48, "in")),
  spoolDiameter: withDefault(MeasurementParam, new Measurement(1.5, "in")),
  carriageWeight: withDefault(MeasurementParam, new Measurement(15, "lbs")),
  payloadWeight: withDefault(MeasurementParam, new Measurement(5, "lbs")),
  gearboxStages: withDefault(NumberParam, 1),
  stage1OutputGear: withDefault(NumberParam, 1),
  stage1InputGear: withDefault(NumberParam, 1),
  stage2OutputGear: withDefault(NumberParam, 1),
  stage2InputGear: withDefault(NumberParam, 1),
  stage3OutputGear: withDefault(NumberParam, 1),
  stage3InputGear: withDefault(NumberParam, 1),
  stage4OutputGear: withDefault(NumberParam, 1),
  stage4InputGear: withDefault(NumberParam, 1),
  extensionPercent: withDefault(NumberParam, 100),
};

export type ElevatorStateV1 = Stateify<typeof ElevatorParamsV1>;
