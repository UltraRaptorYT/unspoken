import { useTheme } from "./theme-provider";

export default function Silhouette({ name }: { name: string }) {
  const { theme } = useTheme();
  return (
    <div className="w-[250px] h-[275px] flex justify-center items-center self-end relative">
      <div
        className="absolute top-0 bottom-0 left-0 right-0 opacity-80"
        style={{
          background: "url(/silhouette.png)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center top",
          filter: `invert(${theme == "dark" ? 1 : 0})`,
        }}
      ></div>
      <p className="text-xl absolute top-1/2 left-1/2 z-10 text-white dark:text-black font-semibold -translate-x-1/2 -translate-y-1/2">
        {name}
      </p>
    </div>
  );
}
