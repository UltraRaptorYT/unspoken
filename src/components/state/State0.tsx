import { RealtimeChannel } from "@supabase/supabase-js";
import CustomButton from "@/components/CustomButton";
import { useState, useEffect } from "react";

export default function State0({
  channel,
  user_id,
}: {
  channel: RealtimeChannel | undefined;
  user_id: string;
  question: string;
  room_id: string | undefined;
}) {
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    if (channel) {
      channel.send({
        type: "broadcast",
        event: "ready",
        payload: { user_id: user_id, state: ready },
      });
    }
  }, [ready]);

  return (
    <div className="flex flex-col max-w-[500px] mx-auto h-full items-center justify-center gap-5">
      <div className="text-lg">Click when Ready</div>
      <CustomButton
        ready={ready}
        onClick={async () => {
          setReady((prevState) => !prevState);
        }}
      ></CustomButton>
    </div>
  );
}
