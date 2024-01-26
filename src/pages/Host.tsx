import { useState, useEffect, ReactNode } from "react";
import { useParams } from "react-router-dom";
import supabase from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { ROOM_TYPE, ReadyState, StateMappingType, QuestionType } from "@/types";
import HostState0 from "@/components/state/host/HostState0";
import HostState1 from "@/components/state/host/HostState1";
import HostState2 from "@/components/state/host/HostState2";
import HostState3 from "@/components/state/host/HostState3";

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

  async function getQuestion() {
    const { data, error } = await supabase
      .from("unspoken_state")
      .select()
      .eq("id", currentState);
    if (error) {
      return console.log(error);
    }
    let currentQn = data[0];
    setQuestion((currentQn as QuestionType).question);
  }

  async function clearRoom() {
    const { error } = await supabase
      .from("unspoken_user_room")
      .delete()
      .eq("room_id", room_id);
    if (error) {
      return console.log(error);
    }
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
            question={"What is your favourite thing about <PERSON>?"}
          ></HostState2>
        ),
        3: (
          <HostState3
            readyState={readyState}
            room_id={room_id}
            question={question}
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
        setCurrentState((prevState) => prevState + 1);
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
      return data[0];
    }
  }

  useEffect(() => {
    async function handleStateChange() {
      await updateRoomState();
      if (currentState === 1) {
        addSession();
      }
      await getQuestion();
      if (currentState === 3) {
        let sessionData = await getSessionData();
        setQuestion(JSON.stringify(sessionData));
      }
      await channel?.send({
        type: "broadcast",
        event: "stateChange",
        payload: { state: currentState },
      });
    }

    handleStateChange();
  }, [currentState]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (permissionGranted) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  }, [permissionGranted]);

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setPermissionGranted(true);
        setStream(cameraStream);
      } catch (error) {
        // If the getUserMedia call fails, handle the error
        console.error("Error accessing camera:", error);
        // You may want to add more error handling here or display a message to the user
      }
    };
    if (
      "mediaDevices" in navigator &&
      "getUserMedia" in navigator.mediaDevices
    ) {
      // Request camera permission
      requestCameraPermission();
    } else {
      console.error("getUserMedia is not supported in this browser");
      // Handle the case where getUserMedia is not supported in the browser
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return dynamicChildren;
}

export default Host;
