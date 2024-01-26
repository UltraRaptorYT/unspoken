import { ReadyState } from "@/types";
import { useState, useEffect, useRef, ReactNode, useMemo } from "react";
import ReactPlayer from "react-player";
import Silhouette from "@/components/Silhouette";
import { Skeleton } from "@/components/ui/skeleton";
import Webcam from "react-webcam";

type SessionDataType = {
  session_id: number;
  room_id: string;
  user1_id: string;
  user1_name: string;
  user2_id: string;
  user2_name: string;
  session_data: { [key: string]: string };
  created_at: Date;
};

const videoConstraints = {
  width: 1920,
  height: 1080,
  facingMode: "user",
};

export default function HostState3({
  question,
}: {
  readyState: ReadyState;
  room_id: string | undefined;
  question: string;
}) {
  let [user1, setUser1] = useState<string>("");
  let [user2, setUser2] = useState<string>("");
  let [imgURL, setImgURL] = useState<string>("");
  let [sessionData, setSessionData] = useState<SessionDataType | null>();
  const webcamRef = useRef<Webcam>(null);
  const attributeMapUser1 = [
    { top: "50%", left: "-35%" },
    { top: "0%", left: "50%" },
    { top: "50%", left: "135%" },
    { top: "25%", left: "-35%" },
    { top: "25%", left: "135%" },
    { top: "75%", left: "-35%" },
    { top: "75%", left: "135%" },
  ];
  const attributeMapUser2 = [
    { top: "50%", left: "135%" },
    { top: "0%", left: "50%" },
    { top: "50%", left: "-35%" },
    { top: "25%", left: "135%" },
    { top: "25%", left: "-35%" },
    { top: "75%", left: "135%" },
    { top: "75%", left: "-35%" },
  ];

  const initialSessionData = useMemo(() => {
    try {
      return JSON.parse(question);
    } catch (error) {
      console.error("Error parsing question:", error);
      return null;
    }
  }, [question]);

  useEffect(() => {
    setSessionData(initialSessionData);
  }, [initialSessionData]);

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
          Thank you for participating
        </h1>
      ),
      duration: 2500,
    },
    {
      text: (
        <div className="flex gap-6 items-center grow">
          <Silhouette name={user1}></Silhouette>
          <h1 className="text-3xl text-center flex flex-col gap-2 justify-center min-w-[350px] max-w-[350px]">
            <span>It's time for a photo!</span>
            <span>Stand in front of screen</span>
            <span>and POSE!</span>
          </h1>
          <Silhouette name={user2}></Silhouette>
        </div>
      ),
      duration: 10000,
    },
    {
      text: (
        <div className="flex gap-7 items-center grow">
          <Silhouette name={user1}></Silhouette>
          <h1 className="text-5xl text-center flex flex-col gap-2 justify-center min-w-[350px] max-w-[350px]">
            3
          </h1>
          <Silhouette name={user2}></Silhouette>
        </div>
      ),
      duration: 1000,
    },
    {
      text: (
        <div className="flex gap-7 items-center grow">
          <Silhouette name={user1}></Silhouette>
          <h1 className="text-5xl text-center flex flex-col gap-2 justify-center min-w-[350px] max-w-[350px]">
            2
          </h1>
          <Silhouette name={user2}></Silhouette>
        </div>
      ),
      duration: 1000,
    },
    {
      text: (
        <div className="flex gap-7 items-center grow">
          <Silhouette name={user1}></Silhouette>
          <h1 className="text-5xl text-center flex flex-col gap-2 justify-center min-w-[350px] max-w-[350px]">
            1
          </h1>
          <Silhouette name={user2}></Silhouette>
        </div>
      ),
      duration: 1000,
    },
    {
      text: (
        <div className="flex gap-7 items-center grow">
          <div className="w-[250px] h-full pt-[85px] flex-col flex relative">
            <h1 className="text-3xl font-semibold w-full text-center">
              {user1}
            </h1>
            <div className="absolute top-[calc(85px+125px)] w-full h-[calc(100%-85px-125px)] left-0 right-0 text-xl">
              {sessionData?.session_data[sessionData.user1_id]
                .split(",")
                .map((val, idx) => {
                  return (
                    <p
                      className="absolute -translate-x-1/2 -translate-y-1/2 max-w-[200px] min-w-[200px] text-center"
                      key={"user1_attr_" + idx}
                      style={{
                        top: attributeMapUser1[idx]["top"],
                        left: attributeMapUser1[idx]["left"],
                      }}
                    >
                      {val}
                    </p>
                  );
                })}
            </div>
          </div>
          <h1 className="text-3xl text-center flex flex-col gap-2 justify-center min-w-[350px] max-w-[350px]"></h1>
          <div className="w-[250px] h-full pt-[85px] flex-col flex relative">
            <h1 className="text-3xl font-semibold w-full text-center">
              {user2}
            </h1>
            <div className="absolute top-[calc(85px+125px)] w-full h-[calc(100%-85px-125px)] left-0 right-0 text-xl">
              {sessionData?.session_data[sessionData.user2_id]
                .split(",")
                .map((val, idx) => {
                  return (
                    <p
                      className="absolute -translate-x-1/2 -translate-y-1/2 max-w-[200px] min-w-[200px] text-center"
                      key={"user2_attr_" + idx}
                      style={{
                        top: attributeMapUser2[idx]["top"],
                        left: attributeMapUser2[idx]["left"],
                      }}
                    >
                      {val}
                    </p>
                  );
                })}
            </div>
          </div>
        </div>
      ),
      duration: 10000,
    },
  ];

  let [textState, setTextState] = useState<number>(0);
  let [displayText, setDisplayText] = useState<ReactNode>(
    textMapString[textState].text
  );
  let [isPlay, setIsPlay] = useState<boolean>(false);
  // let [isPlay2, setIsPlay2] = useState<boolean>(false);

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
    }, textMapString[textState].duration);

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
  const [QRImage, SetQRImage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    console.log(imgURL);
    SetQRImage(imgURL);
    setDisplayText(
      <h1 className="text-3xl text-center flex flex-col gap-2 justify-center min-w-[350px] max-w-[350px]">
        <span>Once again, thank you for participating!</span>
        <span>We hope to see you soon!</span>
        <span>Get your Photo here!</span>
        <div className="w-[150px] aspect-square relative">
          <img
            src={QRImage}
            onLoad={() => setLoading(false)}
            className="w-full h-full rounded-md"
          />
          {loading && (
            <Skeleton className="w-full h-full absolute top-0 left-0 rounded-md" />
          )}
        </div>
      </h1>
    );
  }, [imgURL]);

  return (
    <div className="min-w-[300px] w-full max-w-[1200px] mx-auto h-full flex justify-center items-center my-auto flex-col gap-8">
      {displayText}
      <div className="hidden">
        <ReactPlayer
          url={"/audio.mp3"}
          onEnded={() => {
            setIsPlay(false);
            setTimeout(() => {
              if (webcamRef && webcamRef.current) {
                const imageSrc = webcamRef.current.getScreenshot();
                if (imageSrc) {
                  fetch(imageSrc)
                    .then((res) => res.blob())
                    .then(URL.createObjectURL)
                    .then(setImgURL);
                }
              }
            }, 1000);
          }}
          config={{
            file: {
              forceAudio: true,
            },
          }}
          playing={isPlay}
        />

        {/* <ReactPlayer
          url={"/audio2.mp3"}
          onEnded={() => setIsPlay2(false)}
          config={{
            file: {
              forceAudio: true,
            },
          }}
          playing={isPlay2}
        /> */}
      </div>
      <Webcam
        audio={false}
        width={1920}
        height={1080}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="absolute bottom-[100%]"
      />
    </div>
  );
}
