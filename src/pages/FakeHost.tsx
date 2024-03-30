import { useState, useEffect, ReactNode } from "react";
import HostState0 from "@/components/state/host/HostState0";
import HostState1 from "@/components/state/host/HostState1";
import HostState2 from "@/components/state/host/HostState2";
import HostState3 from "@/components/state/host/HostState3";
import { ReadyState, StateMappingType } from "@/types";
import { Button } from "@/components/ui/button";
import AttributeBox from "@/components/AttributeBox";
import { useAtom } from "jotai";
import { session_data, BASE } from "@/pages/Host";

type GenerateStateMapping = (readyState: ReadyState) => StateMappingType;

function FakeHost() {
  let room_id = "perspiciatis";
  const [currentState, setCurrentState] = useState<number>(0);
  const [dynamicChildren, setDynamicChildren] = useState<ReactNode | null>(
    null
  );
  const [readyState, setReadyState] = useState<ReadyState>({});
  const [question] = useState<string>("");
  const [sessionData, setSessionData] = useAtom(session_data);

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
            clearRoom={() => {}}
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
            question={
              '{"session_id":185,"room_id":"perspiciatis","user1_id":"b0c7ac90-5575-42e4-97ca-24576fcd0a60","user1_name":"Kuang Jun","user2_id":"0299710a-7643-4dc9-830e-475ef42d2f2b","user2_name":"Liming","session_data":{"b0c7ac90-5575-42e4-97ca-24576fcd0a60":"kind,generous,empathetic,optimistic,reliable,confident","0299710a-7643-4dc9-830e-475ef42d2f2b":"resilient,compassionate,resourceful,optimistic,empathetic,dependable"},"created_at":"2024-03-20T16:28:59.943201+00:00"}'
            }
            channel={undefined}
            clearRoom={() => {}}
            skip={true}
          ></HostState3>
        ),
      };
    };
    const updatedChildren = generateStateMapping(readyState);
    setDynamicChildren(updatedChildren[currentState]);
  }, [readyState]);

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
    if (currentState != 3) {
      setSessionData(BASE);
    } else {
      // setSessionData()
    }
  }, [currentState]);

  return (
    <div className="h-full relative min-w-[300px] w-full max-w-[1200px] mx-auto flex justify-center items-center my-auto flex-col gap-8 overflow-hidden">
      <div className="h-full w-full flex grow">
        <div className="grid grid-cols-2 w-full items-center justify-center h-fit">
          {sessionData?.session_data[sessionData.user1_id] &&
            sessionData?.session_data[sessionData.user1_id]
              .split(",")
              .map((e, idx) => {
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
            sessionData?.session_data[sessionData.user2_id]
              .split(",")
              .map((e, idx) => {
                return (
                  <AttributeBox
                    attribute={e}
                    idx={idx}
                    key={"attribute_user2_" + idx}
                  />
                );
              })}
        </div>
      </div>
      <div className="flex gap-5 absolute top-[75%] -translate-y-1/2 left-1/2 -translate-x-1/2">
        <Button
          onClick={() => {
            setReadyState(() => {
              setCurrentState((prev) => {
                if (prev == 0) {
                  return 0;
                }
                return prev - 1;
              });
              return {
                a: true,
                b: true,
              };
            });
          }}
        >
          Prev State
        </Button>
        <Button
          onClick={() => {
            setReadyState(() => {
              setCurrentState((prev) => {
                if (prev == 3) {
                  return 3;
                }
                return prev + 1;
              });
              return {
                a: true,
                b: true,
              };
            });
          }}
        >
          Next State
        </Button>
      </div>
    </div>
  );
}

export default FakeHost;
