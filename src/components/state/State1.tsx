import { RealtimeChannel } from "@supabase/supabase-js";
import CustomButton from "@/components/CustomButton";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import supabase from "@/lib/supabase";
import { toast } from "sonner";

export default function State1({
  channel,
  user_id,
  question,
  room_id,
}: {
  channel: RealtimeChannel | undefined;
  user_id: string;
  question: string;
  room_id: string | undefined;
}) {
  const [ready, setReady] = useState<boolean>(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (channel) {
      channel.send({
        type: "broadcast",
        event: "ready",
        payload: { user_id: user_id, state: ready },
      });
    }
  }, [ready]);

  async function addSessionData(user_name: string) {
    if (room_id) {
      const { data, error } = await supabase
        .from("unspoken_session")
        .select()
        .eq("room_id", room_id)
        .order("created_at", { ascending: false });
      if (error) {
        return console.log(error);
      }
      let currentSession = data ? data[0] : null;
      let global;
      if (currentSession) {
        console.log(currentSession);
        if (user_id == currentSession.user1_id) {
          const { data, error } = await supabase
            .from("unspoken_session")
            .update({ user1_name: user_name })
            .eq("session_id", currentSession.session_id)
            .select();
          if (error) {
            return console.log(error);
          }
          console.log(data);
          global = data;
        } else if (user_id == currentSession.user2_id) {
          const { data, error } = await supabase
            .from("unspoken_session")
            .update({ user2_name: user_name })
            .eq("session_id", currentSession.session_id)
            .select();
          if (error) {
            return console.log(error);
          }
          console.log(data);
          global = data;
        }
      }

      channel?.send({
        type: "broadcast",
        event: "enter-name",
        payload: {
          user_id: user_id,
          name: user_name,
          session_state: global ? global[0] : null,
        },
      });
    }
  }

  async function checkInput() {
    if (inputRef.current) {
      let inputValue = (inputRef.current as HTMLInputElement).value;
      if (inputValue) {
        addSessionData(inputValue);
        setReady((prevState) => !prevState);
      } else {
        toast.error("Please enter your name");
      }
    }
  }

  return (
    <div className="flex flex-col max-w-[300px] mx-auto h-full items-center justify-center gap-5 px-3 py-8 grow">
      <div className="text-xl">{question}</div>
      <Input
        type="text"
        placeholder="Name"
        disabled={ready}
        ref={inputRef}
        defaultValue={""}
      />
      <CustomButton
        ready={ready}
        onClick={async () => {
          checkInput();
        }}
      ></CustomButton>
    </div>
  );
}
