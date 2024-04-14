export default function AttributeBox({
  attribute,
  idx,
}: {
  attribute: string;
  idx: number;
}) {
  const colorArr = [
    ...new Array(6).fill("210e45"),
    ...new Array(6).fill("340042"),
  ];
  // const colorArr = [
  //   "f82553",
  //   "fb6640",
  //   "f8c421",
  //   "49cc5c",
  //   "2c7ce5",
  //   "6434e9",
  //   "ffbe0b",
  //   "fb5607",
  //   "ff006e",
  //   "8338ec",
  //   "3a86ff",
  //   "619eff",
  // ];
  return (
    <div
      className="w-full flex items-center justify-center border aspect-square p-4 text-center text-2xl font-bold"
      style={{ background: "#" + colorArr[idx] }}
    >
      {attribute}
    </div>
  );
}
