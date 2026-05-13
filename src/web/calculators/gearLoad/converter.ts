import { BaseState } from "common/models/ExtraTypes";
import { StateMaker } from "common/tooling/conversion";
import gearLoadConfig, { GearLoadParamsV1 } from "web/calculators/gearLoad";

export class GearLoadState {
  static getState(): BaseState {
    if (gearLoadConfig.version === undefined) {
      throw Error("Config did not set version! " + gearLoadConfig.url);
    }

    return StateMaker.BumpState(gearLoadConfig.version, [GearLoadParamsV1], []);
  }
}
