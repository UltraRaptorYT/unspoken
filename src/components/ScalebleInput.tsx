import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ScaleableInputProps = {
  disabled: boolean;
  maxInput: number;
  attributeArr: string[];
  inputChangeHandler: (key: number, value: string) => void;
  inputRemoveHandler: (key: number) => void;
  inputAddHandler: () => void;
};

export default function ScaleableInput({
  disabled,
  maxInput,
  attributeArr,
  inputChangeHandler,
  inputRemoveHandler,
  inputAddHandler,
}: ScaleableInputProps) {
  return (
    <div className="flex flex-col w-full gap-3">
      {attributeArr.map((value, key) => {
        return (
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              key={"input" + key}
              defaultValue={value}
              placeholder="Enter favourite thing"
              disabled={disabled}
              onChange={(e) => {
                inputChangeHandler(key, e.target.value);
              }}
            ></Input>
            {attributeArr.length > 1 && (
              <Button
                variant={"destructive"}
                size={"sm"}
                onClick={() => inputRemoveHandler(key)}
              >
                -
              </Button>
            )}
          </div>
        );
      })}

      <Button
        disabled={disabled}
        onClick={() => inputAddHandler()}
        className={cn("w-full", attributeArr.length < maxInput ? "" : "hidden")}
      >
        +
      </Button>
    </div>
  );
}
