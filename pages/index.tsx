import type { NextPage } from "next";
import * as Dialog from "@radix-ui/react-dialog";
import data from "../data.json";
import { useState } from "react";

type Type =
  | "Cloud and containers"
  | "Cloud"
  | "Containers"
  | "CI/CD"
  | "Cloud, containers and CI/CD";

type Row = {
  id: string;
  value: string;
  description: string;
  category: string;
  type?: Type;
};

const types: Record<number, Type> = {
  0: "Cloud and containers",
  1: "Cloud",
  2: "Containers",
  3: "CI/CD",
  4: "Cloud, containers and CI/CD",
};

const tagToColor: Record<string, string> = {
  Cloud: "bg-blue-100 text-blue-700",
  Containers: "bg-yellow-100 text-yellow-700",
  "CI/CD": "bg-purple-100 text-purple-700",
};

const typeToTags = (type?: Type) => {
  switch (type) {
    case "Cloud and containers":
      return ["Cloud", "Containers"];
    case "Cloud":
      return ["Cloud"];
    case "Containers":
      return ["Containers"];
    case "CI/CD":
      return ["CI/CD"];
    case "Cloud, containers and CI/CD":
      return ["Cloud", "Containers", "CI/CD"];
    default:
      return [];
  }
};

const RowType = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <div
          key={tag}
          className={`rounded-full px-2 py-1 text-xs font-semibold ${tagToColor[tag]}`}
        >
          {tag}
        </div>
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const categories = Array.from(new Set(data.map((item) => item.category)));
  const categoryIds: Record<string, number> = {};
  categories.forEach((category, index) => {
    categoryIds[category] = index;
  });

  const categoryLists: Row[][] = [];
  categories.forEach(() => {
    categoryLists.push([]);
  });

  data.forEach((row) => {
    categoryLists[categoryIds[row.category]].push(row);
  });

  const longestList = Math.max(...categoryLists.map((list) => list.length));

  const matrix: Row[] = [];
  for (let j = 0; j < longestList; j++) {
    for (let i = 0; i < categories.length; i++) {
      const cell = categoryLists[i][j];

      if (cell) {
        const type = Number(cell.id.split(".")[1]);
        cell.type = types[type];
      }
      matrix.push(cell);
    }
  }

  const [selected, setSelected] = useState<Row | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  return (
    <Dialog.Root
      open={!!selected}
      onOpenChange={(open) => {
        if (!open) {
          setSelected(null);
        }
      }}
    >
      <h1 className="m-4 text-4xl">Cloud Native Threat Matrix</h1>
      <div className="mx-4 flex gap-4">
        <div
          className={`cursor-pointer rounded-full px-3 py-1 ${
            selectedTag === "Cloud"
              ? tagToColor["Cloud"]
              : "bg-white text-gray-700"
          }`}
          onClick={() =>
            setSelectedTag(selectedTag === "Cloud" ? null : "Cloud")
          }
        >
          Cloud
        </div>
        <div
          className={`cursor-pointer rounded-full px-3 py-1 ${
            selectedTag === "Containers"
              ? tagToColor["Containers"]
              : "bg-white text-gray-700"
          }`}
          onClick={() =>
            setSelectedTag(selectedTag === "Containers" ? null : "Containers")
          }
        >
          Containers
        </div>
        <div
          className={`cursor-pointer rounded-full px-3 py-1 ${
            selectedTag === "CI/CD"
              ? tagToColor["CI/CD"]
              : "bg-white text-gray-700"
          }`}
          onClick={() =>
            setSelectedTag(selectedTag === "CI/CD" ? null : "CI/CD")
          }
        >
          CI/CD
        </div>
      </div>
      <div
        className="m-4 grid"
        style={{
          gridTemplateColumns: `repeat(${categories.length}, 200px)`,
        }}
      >
        {categories.map((category) => (
          <div key={category} className="p-2 font-bold">
            {category}
          </div>
        ))}
        {matrix.map((row) => {
          if (!row) {
            return <div />;
          }

          const tags = typeToTags(row.type);

          const notCurrentTag = selectedTag && !tags.includes(selectedTag);

          return (
            <div
              onClick={() => setSelected(row)}
              key={row.id}
              className={`m-1 flex flex-col gap-2 rounded-md bg-white p-3 text-sm ${
                notCurrentTag ? "opacity-30" : ""
              }`}
            >
              <div className="font-semibold">{row.value}</div>
              <RowType tags={tags} />
            </div>
          );
        })}
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed left-0 top-0 bottom-0 right-0 flex items-center justify-center bg-slate-900/30">
          <Dialog.Content className="dialog relative flex max-h-[90%] w-[600px] flex-col gap-4 overflow-y-auto rounded-lg bg-white p-8 drop-shadow-lg">
            <Dialog.Title className="mr-5 flex flex-col gap-2">
              <div className="text-xl font-semibold text-slate-900">
                {selected?.value}
              </div>
              <RowType tags={typeToTags(selected?.type)} />
            </Dialog.Title>
            <Dialog.Description className="flex flex-col gap-4 text-slate-500">
              <div className="text-sm text-slate-400">
                ID:{" "}
                <span className="font-semibold text-slate-600">
                  {selected?.id}
                </span>
              </div>
              {selected?.description
                .replaceAll(/\n+/g, "\n")
                .split("\n")
                .map((line) => (
                  <p
                    className="text-sm leading-6"
                    key={line}
                    dangerouslySetInnerHTML={{
                      __html: line.replaceAll(
                        /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g,
                        (match) => {
                          return `<a href=${match} target="_blank" rel="noreferrer" class="text-blue-500 underline underline-offset-4 decoration-blue-300">${match}</a>`;
                        }
                      ),
                    }}
                  ></p>
                ))}
            </Dialog.Description>
            <Dialog.Close className="absolute top-4 right-4 h-10 w-10 rounded-full text-xl hover:bg-slate-100 active:bg-slate-200">
              ×
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Home;
