import { BaseState } from "common/models/ExtraTypes";
import { StateMaker } from "common/tooling/conversion";
import gearboxConfig, { GearboxParamsV1 } from "web/calculators/gearbox";

export class GearboxState {
  static getState(): BaseState {
    if (gearboxConfig.version === undefined) {
      throw Error("Config did not set version! " + gearboxConfig.url);
    }

    return StateMaker.BumpState(gearboxConfig.version, [GearboxParamsV1], []);
  }
}
