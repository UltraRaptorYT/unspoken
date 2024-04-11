import { useState, useEffect, ReactNode } from "react";
import { useParams } from "react-router-dom";
import supabase from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { ROOM_TYPE, ReadyState, StateMappingType } from "@/types";
import HostState0 from "@/components/state/host/HostState0";
import HostState1 from "@/components/state/host/HostState1";
import HostState2 from "@/components/state/host/HostState2";
import HostState3 from "@/components/state/host/HostState3";
import { useToast } from "@/components/ui/use-toast";
import { atom, useAtom } from "jotai";
import AttributeBox from "@/components/AttributeBox";

export type SessionDataType = {
  session_id: number;
  room_id: string;
  user1_id: string;
  user1_name: string;
  user2_id: string;
  user2_name: string;
  session_data: { [key: string]: string };
  created_at: Date;
};

export const BASE = {
  session_id: 0,
  room_id: "",
  user1_id: "",
  user1_name: "",
  user2_id: "",
  user2_name: "",
  session_data: {
    "": ",,,,,",
  },
  created_at: new Date(),
};

export const session_data = atom<SessionDataType>(BASE);

type GenerateStateMapping = (readyState: ReadyState) => StateMappingType;

function Host() {
  let { room_id } = useParams();
  const [channel, setChannel] = useState<RealtimeChannel>();
  const [currentState, setCurrentState] = useState<number>(0);
  const [readyState, setReadyState] = useState<ReadyState>({});
  const [question] = useState<string>("");
  const [dynamicChildren, setDynamicChildren] = useState<ReactNode | null>(
    null
  );
  const { toast } = useToast();
  const [sessionData, setSessionData] = useAtom(session_data);

  // async function getQuestion() {
  //   const { data, error } = await supabase
  //     .from("unspoken_state")
  //     .select()
  //     .eq("id", currentState);
  //   if (error) {
  //     return console.log(error);
  //   }
  //   let currentQn = data[0];
  //   setQuestion((currentQn as QuestionType).question);
  // }

  async function clearRoom() {
    const { error } = await supabase
      .from("unspoken_user_room")
      .delete()
      .eq("room_id", room_id);
    if (error) {
      return console.log(error);
    }
    toast({
      title: "Room has been reset",
      duration: 1000,
    });
    setTimeout(() => {
      setCurrentState(0);
    }, 100);
  }

  useEffect(() => {
    console.log("IDK", currentState);
    const generateStateMapping: GenerateStateMapping = (
      readyState: ReadyState
    ) => {
      return {
        0: (
          <HostState0
            readyState={readyState}
            room_id={room_id}
            question={question}
            clearRoom={clearRoom}
          ></HostState0>
        ),
        1: (
          <HostState1
            readyState={readyState}
            room_id={room_id}
            question={"What is your name?"}
          ></HostState1>
        ),
        2: (
          <HostState2
            readyState={readyState}
            room_id={room_id}
            question={"What is your favourite thing(s) about <PERSON>?"}
          ></HostState2>
        ),
        3: (
          <HostState3
            readyState={readyState}
            room_id={room_id}
            question={question}
            channel={channel}
            clearRoom={clearRoom}
          ></HostState3>
        ),
      };
    };
    const updatedChildren = generateStateMapping(readyState);
    setDynamicChildren(updatedChildren[currentState]);
  }, [readyState]);

  async function ensureRoomCreated() {
    const { error } = await supabase
      .from("unspoken_room")
      .insert([{ room_id: room_id }])
      .select();
    if (error) {
      if (error.code != "23505") {
        console.log(error);
      }
    }
  }

  async function getRoomState() {
    const { data, error } = await supabase
      .from("unspoken_room")
      .select()
      .eq("room_id", room_id);
    if (error) {
      return console.log(error);
    }
    setCurrentState((data as ROOM_TYPE[])[0]?.state);
  }

  useEffect(() => {
    ensureRoomCreated();

    if (room_id) {
      const channel = supabase.channel(`${room_id}_room`, {
        config: {
          broadcast: {
            self: true,
          },
          presence: {
            key: "HOST",
          },
        },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const newState = channel.presenceState();
          console.log("sync", newState);
        })
        .on("presence", { event: "join" }, async ({ key, newPresences }) => {
          console.log("join", key, newPresences);
          if (newPresences.length > 0) {
            for (let presence of newPresences) {
              setReadyState((prevState) => {
                const newState = { ...prevState };
                newState[presence.user_id] = false;
                return newState;
              });
            }
          }
        })
        .on("presence", { event: "leave" }, async ({ key, leftPresences }) => {
          console.log("leave", key, leftPresences);
          if (leftPresences.length > 0) {
            for (let presence of leftPresences) {
              setReadyState((prevState) => {
                const newState = { ...prevState };
                delete newState[presence.user_id];
                return newState;
              });
            }
          }
          setCurrentState(0);
        });

      channel.on("broadcast", { event: "ready" }, ({ payload }) => {
        console.log(payload);
        setReadyState((prevState) => {
          const newState = { ...prevState };
          newState[payload.user_id] = payload.state;
          return newState;
        });
      });

      channel.subscribe();

      setChannel(channel);
      getRoomState();

      return () => {
        channel.unsubscribe();
        setChannel(undefined);
      };
    }
  }, []);

  async function updateRoomState() {
    const { data, error } = await supabase
      .from("unspoken_room")
      .update({ state: currentState })
      .eq("room_id", room_id);
    if (error) {
      return console.log(error);
    }
    console.log(data);
  }

  useEffect(() => {
    async function handleReadyStateChange() {
      if (Object.values(readyState).filter((ready) => ready).length === 2) {
        setReadyState(() =>
          Object.fromEntries(
            Object.keys(readyState).map((state) => [state, false])
          )
        );
        setCurrentState((prevState) => {
          if (prevState + 1 == 3) {
            getSessionData();
          }
          return prevState + 1;
        });
      }
    }

    handleReadyStateChange();
  }, [readyState]);

  async function addSession() {
    let { error } = await supabase.from("unspoken_session").insert({
      room_id,
      user1_id: Object.keys(readyState)[0],
      user2_id: Object.keys(readyState)[1],
    });

    if (error) {
      return console.log(error);
    }
  }

  async function getSessionData() {
    let { data, error } = await supabase
      .from("unspoken_session")
      .select()
      .eq("room_id", room_id)
      .eq("user1_id", Object.keys(readyState)[0])
      .eq("user2_id", Object.keys(readyState)[1])
      .order("created_at", { ascending: false });
    if (error) {
      return console.log(error);
    }

    if (!data || data?.length == 0) {
      return console.log("ERROR IDK Y");
    } else {
      console.log(
        currentState,
        "SESSION DATA RECEIVED",
        JSON.stringify(data[0])
      );

      setDynamicChildren(
        <HostState3
          readyState={readyState}
          room_id={room_id}
          question={JSON.stringify(data[0])}
          channel={channel}
          clearRoom={clearRoom}
        ></HostState3>
      );
      await channel?.send({
        type: "broadcast",
        event: "stateChange",
        payload: { state: currentState },
      });
      return data[0];
    }
  }

  useEffect(() => {
    async function handleStateChange() {
      console.log(currentState);
      await updateRoomState();
      if (currentState === 1) {
        addSession();
      }
      // await getQuestion();
      if (currentState === 3) {
        return await getSessionData();
      } else {
        return await channel?.send({
          type: "broadcast",
          event: "stateChange",
          payload: { state: currentState },
        });
      }
    }

    handleStateChange();
    if (currentState === 3) {
      getSessionData();
    } else {
      setSessionData(BASE);
    }
  }, [currentState]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: false, video: true })
      .then(function (stream) {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
        }
      })
      .catch(function (error) {
        console.error("Error accessing video stream:", error);
      });
  }, []);

  useEffect(() => {
    if (currentState == 3) {
      getSessionData();
    }
  }, [dynamicChildren]);

  function addLength(arr: string[]) {
    let newArr = [...arr, ...Array(Math.max(0, 6 - arr.length)).fill("")];
    console.log(newArr);
    return newArr;
  }

  return (
    <div className="h-full relative min-w-[300px] w-full max-w-[1200px] mx-auto flex justify-center items-center my-auto flex-col gap-8 overflow-hidden">
      <div className="h-full w-full flex grow">
        <div className="grid grid-cols-2 w-full items-center justify-center h-fit">
          {sessionData?.session_data[sessionData.user1_id] &&
            addLength(
              (sessionData as SessionDataType)?.session_data[
                sessionData.user1_id
              ].split(",")
            ).map((e, idx) => {
              return (
                <AttributeBox
                  attribute={e}
                  idx={idx}
                  key={"attribute_user1_" + idx}
                />
              );
            })}
        </div>
        {dynamicChildren}
        <div className="grid grid-cols-2 w-full items-center justify-center h-fit">
          {sessionData?.session_data[sessionData.user2_id] &&
            addLength(
              (sessionData as SessionDataType)?.session_data[
                sessionData.user2_id
              ].split(",")
            ).map((e, idx) => {
              return (
                <AttributeBox
                  attribute={e}
                  idx={idx + 6}
                  key={"attribute_user2_" + idx}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default Host;
