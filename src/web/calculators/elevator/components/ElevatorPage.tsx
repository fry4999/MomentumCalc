import Metadata from "common/components/Metadata";
import elevatorConfig from "web/calculators/elevator";
import ElevatorCalculator from "web/calculators/elevator/components/ElevatorCalculator";

export default function ElevatorPage(): JSX.Element {
  return (
    <>
      <Metadata pageConfig={elevatorConfig} />
      <ElevatorCalculator />
    </>
  );
}
