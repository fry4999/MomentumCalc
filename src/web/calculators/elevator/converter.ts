import { BaseState } from "common/models/ExtraTypes";
import { StateMaker } from "common/tooling/conversion";
import elevatorConfig, { ElevatorParamsV1 } from "web/calculators/elevator";

export class ElevatorState {
  static getState(): BaseState {
    if (elevatorConfig.version === undefined) {
      throw Error("Config did not set version! " + elevatorConfig.url);
    }

    return StateMaker.BumpState(elevatorConfig.version, [ElevatorParamsV1], []);
  }
}
