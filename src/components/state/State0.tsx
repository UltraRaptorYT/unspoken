import { RealtimeChannel } from "@supabase/supabase-js";
import CustomButton from "@/components/CustomButton";
import { useState, useEffect } from "react";

export default function State0({
  readyState,
}: {
  channel: RealtimeChannel | undefined;
  user_id: string;
  question: string;
  room_id: string | undefined;
  readyState: (ready: boolean) => void;
}) {
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    async function updateReady() {
      readyState(ready);
    }
    updateReady();
  }, [ready]);

  return (
    <div className="flex flex-col max-w-[300px] mx-auto h-full items-center justify-center gap-5 px-3 py-8 grow">
      <div className="flex flex-col items-center justify-center">
        <div className="text-xl">Waiting for other user...</div>
        <div className="text-lg">Click when Ready</div>
      </div>
      <CustomButton
        ready={ready}
        onClick={async () => {
          setReady((prevState) => !prevState);
        }}
      ></CustomButton>
    </div>
  );
}
