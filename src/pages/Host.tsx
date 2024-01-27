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

type GenerateStateMapping = (readyState: ReadyState) => StateMappingType;

function Host() {
  let { room_id } = useParams();
  const [channel, setChannel] = useState<RealtimeChannel>();
  const [currentState, setCurrentState] = useState<number>(0);
  const [readyState, setReadyState] = useState<ReadyState>({});
  const [question, setQuestion] = useState<string>("");
  const [dynamicChildren, setDynamicChildren] = useState<ReactNode | null>(
    null
  );
  const { toast } = useToast();

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
    setCurrentState(0);
    toast({
      title: "Room has been reset",
      duration: 1000,
    });
  }

  useEffect(() => {
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
      return;
    } else {
      setQuestion(JSON.stringify(data[0]));
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
        await getSessionData();
      }
      await channel?.send({
        type: "broadcast",
        event: "stateChange",
        payload: { state: currentState },
      });
    }

    handleStateChange();
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

  return dynamicChildren;
}

export default Host;
