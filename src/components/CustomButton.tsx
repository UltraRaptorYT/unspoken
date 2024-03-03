import { Button } from "@/components/ui/button";

type CustomButtonProps = {
  onClick: () => void;
  ready: boolean;
};

export default function CustomButton({ onClick, ready }: CustomButtonProps) {
  return (
    <Button
      onClick={() => {
        onClick();
      }}
    > 
      {ready ? "Not Ready" : "Ready"}
    </Button>
  );
}
