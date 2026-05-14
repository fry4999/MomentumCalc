import SingleInputLine from "common/components/io/inputs/SingleInputLine";
import { NumberInput } from "common/components/io/new/inputs";
import { Button, Column, Columns } from "common/components/styling/Building";
import { StateHook } from "common/models/ExtraTypes";
import RatioPairList, { RatioPair } from "common/models/RatioPair";
import { useEffect, useState } from "react";

export default function RatioPairInput(props: {
  label: string;
  ratioPair: RatioPair;
  stageIndex: number;
  stateHook: StateHook<RatioPairList>;
  canRemove: boolean;
  onRemove: () => void;
}): JSX.Element {
  const [, setRpl] = props.stateHook;
  const [driving, setDriving] = useState(props.ratioPair[0]);
  const [driven, setDriven] = useState(props.ratioPair[1]);

  useEffect(() => {
    const new_: RatioPair = [driving, driven];
    setRpl((current) => current.replaceAt(props.stageIndex, new_));
  }, [driving, driven, props.stageIndex, setRpl]);

  return (
    <>
      <Columns vcentered mobile>
        <Column>{props.label}</Column>
        <Column>
          <SingleInputLine label="">
            <NumberInput stateHook={[driving, setDriving]} />
          </SingleInputLine>
        </Column>
        <Column>
          <SingleInputLine label="">
            <NumberInput stateHook={[driven, setDriven]} />
          </SingleInputLine>
        </Column>
        <Column narrow>
          {props.canRemove ? (
            <Button
              color="danger"
              faIcon="trash"
              light
              onClick={props.onRemove}
              size="small"
            >
              Remove
            </Button>
          ) : (
            <span className="button is-small is-static is-invisible">
              Remove
            </span>
          )}
        </Column>
      </Columns>
    </>
  );
}
