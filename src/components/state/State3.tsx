import { RealtimeChannel } from "@supabase/supabase-js";
import CustomButton from "@/components/CustomButton";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import supabase from "@/lib/supabase";

export default function State2({
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
  let [currentQn, setCurrentQn] = useState<string>("");
  const { toast } = useToast();
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

  async function getOtherUserName() {
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
      if (currentSession) {
        let userName;
        if (user_id == currentSession.user1_id) {
          userName = currentSession.user2_name;
        } else if (user_id == currentSession.user2_id) {
          userName = currentSession.user1_name;
        }
        setCurrentQn(question.replace("<PERSON>", userName));
      }
    }
  }

  useEffect(() => {
    getOtherUserName();
  }, [question]);

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
      }
    }
  }

  async function checkInput() {
    if (inputRef.current) {
      let inputValue = (inputRef.current as HTMLTextAreaElement).value;
      if (inputValue) {
        addSessionData(inputValue);
        setReady((prevState) => !prevState);
      } else {
        toast({
          title: "Please enter your name",
          variant: "destructive",
          duration: 1000,
        });
      }
    }
  }

  return (
    <div className="flex flex-col max-w-[300px] mx-auto h-full items-center justify-center gap-5 px-3 py-8 grow">
      <div className="text-xl">{currentQn}</div>
      <Textarea placeholder={currentQn} disabled={ready} />
      <CustomButton
        ready={ready}
        onClick={async () => {
          checkInput();
          setReady((prevState) => !prevState);
        }}
      ></CustomButton>
    </div>
  );
}
