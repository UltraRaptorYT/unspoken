import { RealtimeChannel } from "@supabase/supabase-js";
import CustomButton from "@/components/CustomButton";
import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import ScalableInput from "../ScalableInput";
import { toast } from "sonner";

export default function State2({
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
  let [currentQn, setCurrentQn] = useState<string>("");
  const [attributeArr, setAttributeArr] = useState<string[]>([""]);

  useEffect(() => {
    async function updateReady() {
      readyState(ready);
    }
    updateReady();
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

  async function addSessionData(userBody: string) {
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
        let updateValue: { [key: string]: string } =
          currentSession.session_data;
        if (user_id == currentSession.user1_id) {
          updateValue[currentSession.user2_id] = userBody;
          const { error } = await supabase
            .from("unspoken_session")
            .update({ session_data: updateValue })
            .eq("session_id", currentSession.session_id);
          if (error) {
            return console.log(error);
          }
        } else if (user_id == currentSession.user2_id) {
          updateValue[currentSession.user1_id] = userBody;
          const { error } = await supabase
            .from("unspoken_session")
            .update({ session_data: updateValue })
            .eq("session_id", currentSession.session_id);
          if (error) {
            return console.log(error);
          }
        }
      }
    }
  }

  async function checkInput() {
    if (attributeArr.filter((e) => e).length == 0) {
      return toast.error(
        "Please enter something you like about the other person"
      );
    } else {
      setAttributeArr((prevState) => {
        let list = [...prevState];
        list = list.filter((val, idx) => val && list.indexOf(val) == idx);
        addSessionData(list.join("|"));
        return list;
      });
      setReady((prevState) => !prevState);
    }
  }

  async function inputChangeHandler(key: number, value: string) {
    setAttributeArr((prevState) => {
      let list = [...prevState];
      list[key] = value;
      return list;
    });
  }

  async function inputRemoveHandler(key: number) {
    setAttributeArr((prevState) => {
      let list = [...prevState];
      list.splice(key, 1);
      return list;
    });
  }

  async function inputAddHandler() {
    setAttributeArr((prevState) => {
      let list = [...prevState];
      list.push("");
      return list;
    });
  }

  return (
    <div className="flex flex-col max-w-[300px] mx-auto h-full items-center justify-center gap-5 px-3 py-8 grow py-8 grow">
      <div className="text-xl">{currentQn}</div>
      <ScalableInput
        disabled={ready}
        maxInput={6}
        attributeArr={attributeArr}
        inputChangeHandler={inputChangeHandler}
        inputRemoveHandler={inputRemoveHandler}
        inputAddHandler={inputAddHandler}
      ></ScalableInput>
      <CustomButton
        ready={ready}
        onClick={async () => {
          checkInput();
        }}
      ></CustomButton>
    </div>
  );
}
