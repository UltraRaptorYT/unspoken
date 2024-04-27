import { ReadyState } from "@/types";
import { useState, useEffect, useRef, ReactNode, useMemo } from "react";
import ReactPlayer from "react-player";
// import Silhouette from "@/components/Silhouette";
import { Skeleton } from "@/components/ui/skeleton";
import Webcam from "react-webcam";
import supabase from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { session_data } from "@/pages/Host";

const videoConstraints = {
  width: 1920,
  height: 1080,
};

export default function HostState3({
  question,
  room_id,
  // readyState,
  channel,
  clearRoom,
  skip = false,
}: {
  readyState: ReadyState;
  room_id: string | undefined;
  question: string;
  channel: RealtimeChannel | undefined;
  clearRoom: () => void;
  skip?: boolean;
}) {
  let [user1, setUser1] = useState<string>("");
  let [user2, setUser2] = useState<string>("");
  let [imgURL, setImgURL] = useState<string>("");
  let [sessionData, setSessionData] = useAtom(session_data);
  const webcamRef = useRef<Webcam>(null);
  // const attributeMapUser1 = [
  //   { top: "50%", left: "-35%" },
  //   { top: "0%", left: "50%" },
  //   { top: "50%", left: "135%" },
  //   { top: "25%", left: "-35%" },
  //   { top: "25%", left: "135%" },
  //   { top: "75%", left: "-35%" },
  //   { top: "75%", left: "135%" },
  // ];
  // const attributeMapUser2 = [
  //   { top: "50%", left: "135%" },
  //   { top: "0%", left: "50%" },
  //   { top: "50%", left: "-35%" },
  //   { top: "25%", left: "135%" },
  //   { top: "25%", left: "-35%" },
  //   { top: "75%", left: "135%" },
  //   { top: "75%", left: "-35%" },
  // ];

  const initialSessionData = useMemo(() => {
    try {
      console.log(question);
      if (!question) {
        return null; // or provide a default value
      }
      if (typeof question == "string") {
        return JSON.parse(question);
      }
      return question;
    } catch (error) {
      console.error("Error parsing question:", error);
      return null;
    }
  }, [question]);

  // async function getSessionData() {
  //   let { data, error } = await supabase
  //     .from("unspoken_session")
  //     .select()
  //     .eq("room_id", room_id)
  //     .eq("user1_id", Object.keys(readyState)[0])
  //     .eq("user2_id", Object.keys(readyState)[1])
  //     .order("created_at", { ascending: false });
  //   if (error) {
  //     return console.log(error);
  //   }

  //   if (!data || data?.length == 0) {
  //     return;
  //   } else {
  //     setSessionData(data[0]);
  //     return data[0];
  //   }
  // }
  // useEffect(() => {
  //   if (initialSessionData !== null) {
  //     setSessionData(initialSessionData);
  //   }
  // }, [initialSessionData]);

  //  && textState == textMapString.length - 1

  useEffect(() => {
    if (sessionData) {
      setUser1(sessionData.user1_name);
      setUser2(sessionData.user2_name);
    }
  }, [sessionData]);

  const textMapString: { text: ReactNode; duration: number }[] = [
    {
      text: (
        <h1 className="text-3xl text-center flex flex-col gap-2 justify-center">
          Thank you for participating in unspoken
        </h1>
      ),
      duration: 2500,
    },
    {
      text: (
        <div className="flex gap-4 items-center grow">
          {/* <Silhouette name={user1}></Silhouette> */}
          <h1 className="text-3xl text-center flex flex-col gap-2 justify-center min-w-[340px] max-w-[340px] p-3">
            <span>It's time for a photo!</span>
            <span>Stand in front of screen following your name and POSE!</span>
            <div className="w-full text-center text-4xl">
              <span>{user1}</span>
              <span> & </span>
              <span>{user2}</span>
            </div>
          </h1>
          {/* <Silhouette name={user2}></Silhouette> */}
        </div>
      ),
      duration: 10000,
    },
    {
      text: (
        <div className="flex gap-4 items-center grow">
          {/* <Silhouette name={user1}></Silhouette> */}
          <h1 className="text-5xl text-center flex flex-col gap-2 justify-center min-w-[350px] max-w-[350px]">
            3
          </h1>
          {/* <Silhouette name={user2}></Silhouette> */}
        </div>
      ),
      duration: 1000,
    },
    {
      text: (
        <div className="flex gap-4 items-center grow">
          {/* <Silhouette name={user1}></Silhouette> */}
          <h1 className="text-5xl text-center flex flex-col gap-2 justify-center min-w-[350px] max-w-[350px]">
            2
          </h1>
          {/* <Silhouette name={user2}></Silhouette> */}
        </div>
      ),
      duration: 1000,
    },
    {
      text: (
        <div className="flex gap-4 items-center grow">
          {/* <Silhouette name={user1}></Silhouette> */}
          <h1 className="text-5xl text-center flex flex-col gap-2 justify-center min-w-[350px] max-w-[350px]">
            1
          </h1>
          {/* <Silhouette name={user2}></Silhouette> */}
        </div>
      ),
      duration: 1000,
    },
    {
      text: (
        <div className="w-full flex grow">
          {/* <div className="grid grid-cols-2 w-full items-center justify-center h-fit">
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
          </div> */}
          <div className="w-full mx-auto h-full flex justify-center items-center my-auto flex-col gap-8">
            <div className="flex flex-col gap-2.5">
              <h1 className="text-4xl text-center flex flex-col gap-2 justify-center min-w-[350px] max-w-[350px]">
                unspoken.
              </h1>
              <div className="w-full text-center text-lg">
                <span>{user1}</span>
                <span> & </span>
                <span>{user2}</span>
              </div>
            </div>
          </div>
          {/* <div className="grid grid-cols-2 w-full items-center justify-center h-fit">
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
          </div> */}
        </div>
      ),
      duration: 100000,
    },
    // {
    //   text: (
    //     <>
    //       <div className="flex gap-4 items-center grow">
    //         <div className="w-[250px] h-full pt-[300px] flex-col flex relative">
    //           <h1 className="text-3xl font-semibold w-full text-center">
    //             {user1}
    //           </h1>
    //           <div className="absolute top-[calc(300px+125px)] w-full h-[calc(100%-300px-125px)] left-0 right-0 text-xl">
    //             {sessionData?.session_data[sessionData.user1_id] &&
    //               sessionData?.session_data[sessionData.user1_id]
    //                 .split(",")
    //                 .map((val, idx) => {
    //                   return (
    //                     <p
    //                       className="absolute -translate-x-1/2 -translate-y-1/2 max-w-[200px] min-w-[200px] text-center"
    //                       key={"user1_attr_" + idx}
    //                       style={{
    //                         top: attributeMapUser1[idx]["top"],
    //                         left: attributeMapUser1[idx]["left"],
    //                       }}
    //                     >
    //                       {val}
    //                     </p>
    //                   );
    //                 })}
    //           </div>
    //         </div>
    //         <h1 className="text-3xl text-center flex flex-col gap-2 justify-center min-w-[350px] max-w-[350px]"></h1>
    //         <div className="w-[250px] h-full pt-[300px] flex-col flex relative">
    //           <h1 className="text-3xl font-semibold w-full text-center">
    //             {user2}
    //           </h1>
    //           <div className="absolute top-[calc(300px+125px)] w-full h-[calc(100%-300px-125px)] left-0 right-0 text-xl">
    //             {sessionData?.session_data[sessionData.user2_id] &&
    //               sessionData?.session_data[sessionData.user2_id]
    //                 .split(",")
    //                 .map((val, idx) => {
    //                   return (
    //                     <p
    //                       className="absolute -translate-x-1/2 -translate-y-1/2 max-w-[200px] min-w-[200px] text-center"
    //                       key={"user2_attr_" + idx}
    //                       style={{
    //                         top: attributeMapUser2[idx]["top"],
    //                         left: attributeMapUser2[idx]["left"],
    //                       }}
    //                     >
    //                       {val}
    //                     </p>
    //                   );
    //                 })}
    //           </div>
    //         </div>
    //       </div>
    //       <div className="absolute top-[100%] h-full w-[1080px] flex mx-auto justify-center">
    //         <div className="flex flex-col">
    //           {sessionData?.session_data[sessionData.user1_id] &&
    //             sessionData?.session_data[sessionData.user1_id]
    //               .split(",")
    //               .map((val, idx) => {
    //                 return (
    //                   <div
    //                     className="box border p-2"
    //                     key={"user1_a_" + idx}
    //                     style={{
    //                       backgroundColor: `hsl(${25 * idx}, 100%, 50%)`,
    //                     }}
    //                   >
    //                     <div className="absolute top-2 left-2 text-xs">
    //                       {idx + 1}
    //                     </div>
    //                     {val}
    //                   </div>
    //                 );
    //               })}
    //         </div>
    //         <div className="flex flex-col">
    //           {sessionData?.session_data[sessionData.user2_id] &&
    //             sessionData?.session_data[sessionData.user2_id]
    //               .split(",")
    //               .map((val, idx) => {
    //                 return (
    //                   <div
    //                     className="box border p-2"
    //                     key={"user2_a_" + idx}
    //                     style={{
    //                       backgroundColor: `hsl(${25 * (12 - idx)}, 100%, 50%)`,
    //                     }}
    //                   >
    //                     <div className="absolute top-2 left-2 text-xs">
    //                       {idx + 1 + 6}
    //                     </div>
    //                     {val}
    //                   </div>
    //                 );
    //               })}
    //         </div>
    //       </div>
    //     </>
    //   ),
    //   duration: 100000,
    // },
  ];

  let [textState, setTextState] = useState<number>(0);
  let [displayText, setDisplayText] = useState<ReactNode>(
    textMapString[textState].text
  );
  let [isPlay, setIsPlay] = useState<boolean>(false);
  let [isPlay2, setIsPlay2] = useState<boolean>(false);

  useEffect(() => {
    if (initialSessionData !== null && textState >= textMapString.length - 1) {
      setSessionData(initialSessionData);
    }
  }, [textState]);

  useEffect(() => {
    if (initialSessionData !== null) {
      setUser1(initialSessionData.user1_name);
      setUser2(initialSessionData.user2_name);
    }
  }, [initialSessionData]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Move to the next text after the specified duration
      setTextState((prevIndex) => {
        if ((prevIndex + 1) % textMapString.length == 0 && prevIndex != 0) {
          return prevIndex;
        } else {
          return prevIndex + 1;
        }
      });
    }, (textMapString[textState].duration / 1) * (skip ? 0.1 : 1));

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, [textState]);

  useEffect(() => {
    // Update the current text when the index changes
    setDisplayText(textMapString[textState].text);
    if (textState >= 2) {
      setIsPlay(true);
    } else {
      setIsPlay(false);
    }
  }, [textState]);

  useEffect(() => {
    console.log(isPlay ? "PLAYING" : "NOPE");
  }, [isPlay]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (imgURL) {
      setDisplayText(
        <h1 className="text-3xl text-center flex flex-col gap-4 justify-center">
          <span>Once again, thank you for participating!</span>
          <span>We hope to see you soon!</span>
          <div className="w-full aspect-video relative mx-auto p-2">
            <img
              src={imgURL}
              onLoad={() => setLoading(false)}
              className="w-full h-full rounded-md object-cover"
            />
            {loading && (
              <Skeleton className="w-full h-full absolute top-0 left-0 rounded-md" />
            )}
          </div>
          <Button
            variant={"secondary"}
            onClick={() => clearRoom()}
            className="w-fit mx-auto"
          >
            Reset Room
          </Button>
        </h1>
      );
    }
  }, [imgURL]);

  async function uploadImage(file: Blob) {
    let filePath = `${String(new Date().getTime())}_${room_id}.jpeg`;
    const { data, error } = await supabase.storage
      .from("unspoken_image")
      .upload(filePath, file);

    if (error) {
      return console.log(error);
    }
    console.log(data.path);
    channel?.send({
      type: "broadcast",
      event: "getImage",
      payload: {
        imgURL:
          import.meta.env.VITE_SUPABASE_URL +
          "/storage/v1/object/public/unspoken_image/" +
          data.path,
      },
    });
    setImgURL(
      import.meta.env.VITE_SUPABASE_URL +
        "/storage/v1/object/public/unspoken_image/" +
        data.path
    );
    setIsPlay2(true);
    setLoading(false);
  }

  return (
    <div className="min-w-[300px] w-full max-w-[500px] mx-auto h-full flex justify-center items-center my-auto flex-col gap-8">
      {displayText}
      <div className="hidden">
        <ReactPlayer
          url={"/audio.mp3"}
          onEnded={() => {
            setIsPlay(false);
            if (!skip) {
              setTimeout(() => {
                if (webcamRef && webcamRef.current) {
                  const imageSrc = webcamRef.current.getScreenshot();
                  if (imageSrc) {
                    fetch(imageSrc)
                      .then((res) => res.blob())
                      .then(uploadImage);
                  }
                }
              }, 2500);
            }
          }}
          config={{
            file: {
              forceAudio: true,
            },
          }}
          playing={isPlay}
          muted={skip}
        />

        <ReactPlayer
          url={"/audio2.mp3"}
          onEnded={() => setIsPlay2(false)}
          config={{
            file: {
              forceAudio: true,
            },
          }}
          playing={isPlay2}
        />
      </div>
      {!imgURL && (
        <Webcam
          audio={false}
          width={1920}
          height={1080}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="absolute top-[0%] aspect-video w-full opacity-0 collapse h-full"
        />
      )}
    </div>
  );
}
