import { useState, useEffect, ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { ROOM_TYPE, StateMappingType, QuestionType } from "@/types";
import State0 from "@/components/state/State0";
import State1 from "@/components/state/State1";
import State2 from "@/components/state/State2";
import State3 from "@/components/state/State3";
import { Button } from "@/components/ui/button";

const user_id = uuidv4();

type GenerateStateMapping = () => StateMappingType;

function Room() {
  const { room_id } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<RealtimeChannel>();
  const [currentState, setCurrentState] = useState<number>(0);
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
    console.log(data);
    let currentQn = data[0];
    setQuestion((currentQn as QuestionType).question);
  }

  useEffect(() => {
    async function handleStateChange() {
      await getQuestion();
      const generateStateMapping: GenerateStateMapping = () => {
        return {
          0: (
            <State0
              channel={channel}
              user_id={user_id}
              question={question}
              room_id={room_id}
            ></State0>
          ),
          1: (
            <State1
              channel={channel}
              user_id={user_id}
              question={"What is your name?"}
              room_id={room_id}
            ></State1>
          ),
          2: (
            <State2
              channel={channel}
              user_id={user_id}
              question={"What is your favourite thing(s) about <PERSON>?"}
              room_id={room_id}
            ></State2>
          ),
          3: (
            <State3
              channel={channel}
              user_id={user_id}
              question={"Proceed to the front and POSE!"}
              room_id={room_id}
            ></State3>
          ),
        };
      };
      const updatedChildren = generateStateMapping();
      setDynamicChildren(updatedChildren[currentState]);
    }

    handleStateChange();
  }, [currentState, channel]);

  async function checkRoomState() {
    let { data, error } = await supabase
      .from("unspoken_user_room")
      .select()
      .eq("room_id", room_id);
    if (error) {
      return console.error("Error");
    }
    if (data && data.length > 2) {
      return navigate("/");
    }
  }

  async function checkRoomExist() {
    let { data, error } = await supabase
      .from("unspoken_room")
      .select()
      .eq("room_id", room_id)
      .eq("state", 0);
    if (error) {
      return console.error("Error");
    }
    if (data?.length == 0) {
      return navigate("/");
    }
    await checkRoomState();
    setCurrentState((data as ROOM_TYPE[])[0]?.state);
    return console.log("ROOM OKAY");
  }

  async function addUser() {
    let { error } = await supabase
      .from("unspoken_user")
      .insert({ user_id: user_id })
      .select();
    if (error) {
      return console.error("Error");
    }
    return console.log(`USER ${user_id} INSERTED`);
  }

  async function addUserRoom(user_id: string, room_id: string) {
    let { error } = await supabase
      .from("unspoken_user_room")
      .insert({ user_id: user_id, room_id: room_id })
      .select();
    if (error) {
      return console.error("Error");
    }
    return console.log(`USER ${user_id} INSERTED INTO ROOM ${room_id}`);
  }

  async function removeUserRoom(user_id: string, room_id: string) {
    let { error } = await supabase
      .from("unspoken_user_room")
      .delete()
      .eq("user_id", user_id)
      .eq("room_id", room_id);
    if (error) {
      return console.error("Error");
    }
    return console.log(`USER ${user_id} REMOVED FROM ROOM ${room_id}`);
  }

  useEffect(() => {
    if (room_id) {
      checkRoomExist();
      const channel = supabase.channel(`${room_id}_room`, {
        config: {
          broadcast: {
            self: true,
          },
          presence: {
            key: user_id,
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
          await addUser();
          await addUserRoom(key, room_id);
          await checkRoomState();
        })
        .on("presence", { event: "leave" }, async ({ key, leftPresences }) => {
          console.log("leave", key, leftPresences);
          await removeUserRoom(key, room_id);
          await checkRoomState();
          setCurrentState(0);
        });

      async function downloadImage(imgURL: string) {
        const link = document.createElement("a");
        link.setAttribute("target", "_blank");
        link.download = imgURL.substring(
          imgURL.lastIndexOf("/") + 1,
          imgURL.length
        );
        let data = await fetch(imgURL);
        let blob = await data.blob();
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      channel
        .on(
          "broadcast",
          { event: "stateChange" },
          ({ payload }: { payload: { state: number } }) => {
            console.log(payload);
            setCurrentState(payload.state);
          }
        )
        .on(
          "broadcast",
          { event: "getImage" },
          ({ payload }: { payload: { imgURL: string } }) => {
            console.log(payload);
            setDynamicChildren(
              <div className="flex flex-col max-w-[300px] mx-auto h-full items-center justify-center gap-5 px-3 py-8 grow">
                <div className="text-xl text-center">Download Image here!</div>
                <Button
                  variant={"secondary"}
                  onClick={() => downloadImage(payload.imgURL)}
                >
                  Download here
                </Button>
              </div>
            );
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "unspoken_user_room",
          },
          (payload) => {
            console.log(payload);
            navigate("/");
          }
        );

      channel.subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return;
        }

        const presenceTrackStatus = await channel.track({ user_id: user_id });
        console.log(presenceTrackStatus);
      });
      setChannel(channel);

      return () => {
        channel.unsubscribe();
        setChannel(undefined);
      };
    }
  }, []);

  return dynamicChildren;
}

export default Room;
