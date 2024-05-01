import { useState, useEffect, ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { StateMappingType, QuestionType } from "@/types";
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
  const [imgURL, setImgURL] = useState<string>("");

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
    // await checkRoomState();
    // setCurrentState((data as ROOM_TYPE[])[0]?.state);
    return console.log("ROOM OKAY");
  }

  useEffect(() => {
    if (!imgURL) {
      return;
    }
    setDynamicChildren(() => {
      return (
        <div className="flex flex-col max-w-[300px] mx-auto h-full items-center justify-center gap-5 px-3 py-8 grow">
          <img src={imgURL} className="w-full" />
          <div>Screenshot Page to save download URL</div>
          <div className="w-[150px] aspect-square relative">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=5&data=${
                import.meta.env.VITE_CLIENT_URL
              }/downloadImageURL?imageURL=${imgURL}`}
              className="w-full h-full rounded-md"
            />
          </div>
          <div className="text-xl text-center">Download Image here!</div>
          <Button variant={"secondary"} onClick={() => downloadImage(imgURL)}>
            Download here
          </Button>
        </div>
      );
    });
  }, [imgURL]);

  useEffect(() => {
    console.log(user_id);
    if (room_id) {
      checkRoomExist();
      let channel = supabase.channel(`${room_id}_room`, {
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
        .on("presence", { event: "sync" }, async () => {
          const newState = channel.presenceState();
          console.log("sync", newState);
        })
        .on("presence", { event: "join" }, async ({ key, newPresences }) => {
          console.log("join", key, newPresences);
        })
        .on("presence", { event: "leave" }, async ({ key, leftPresences }) => {
          console.log("leave", key, leftPresences);
        });

      channel
        .on("broadcast", { event: "kick-room" }, (payload) => {
          console.log(payload);
          if (payload.payload.user_id == user_id) {
            navigate("/");
          }
        })
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
            setImgURL(payload.imgURL);
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
