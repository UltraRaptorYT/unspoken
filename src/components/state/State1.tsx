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
  readyState,
}: {
  channel: RealtimeChannel | undefined;
  user_id: string;
  question: string;
  room_id: string | undefined;
  readyState: (ready: boolean) => void;
}) {
  const [ready, setReady] = useState<boolean>(false);
  const inputRef = useRef(null);

  useEffect(() => {
    async function updateReady() {
      readyState(ready);
    }
    if (inputRef.current) {
      let inputValue = (inputRef.current as HTMLInputElement).value;
      addSessionData(inputValue);
    }
    updateReady();
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
      console.log("session", currentSession);
      if (currentSession) {
        console.log(currentSession);
        if (user_id == currentSession.user1_id) {
          const { error } = await supabase
            .from("unspoken_session")
            .update({ user1_name: user_name })
            .eq("session_id", currentSession.session_id);
          if (error) {
            return console.log(error);
          }
        } else if (user_id == currentSession.user2_id) {
          const { error } = await supabase
            .from("unspoken_session")
            .update({ user2_name: user_name })
            .eq("session_id", currentSession.session_id);
          if (error) {
            return console.log(error);
          }
        }
      } else {
        // TODO add a new session
      }
    }
  }

  async function checkInput() {
    if (inputRef.current) {
      let inputValue = (inputRef.current as HTMLInputElement).value.trim();
      if (inputValue) {
        console.log(channel);
        if (channel) {
          channel.send({
            type: "broadcast",
            event: "update-name",
            payload: { user_id: user_id, name: inputValue },
          });
        }
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
