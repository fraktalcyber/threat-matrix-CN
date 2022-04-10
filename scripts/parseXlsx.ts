import xlsx from "node-xlsx";
import fs from "fs";

const workSheetsFromFile = xlsx.parse(`./scripts/matrix.xlsx`);

const { data } = workSheetsFromFile[0];
const mapped = data
  .map((row) => {
    if (!Array.isArray(row)) {
      throw new Error("");
    }

    return Array.from(row, (item) => (!!item && item !== "\r\n" ? item : null));
  })
  .filter((row) => {
    return row.some((item) => !!item);
  });

const categories = mapped.shift() as string[];

const parsedData = [];

for (let rowIndex = 0; rowIndex < mapped.length; rowIndex += 2) {
  for (
    let categoryIndex = 0;
    categoryIndex < mapped[rowIndex].length;
    categoryIndex++
  ) {
    if (!mapped[rowIndex][categoryIndex]) {
      continue;
    }

    const category = categories[categoryIndex];
    const value = mapped[rowIndex][categoryIndex];
    const [id, ...description] =
      mapped[rowIndex + 1][categoryIndex].split("\r\n");

    parsedData.push({
      category,
      value,
      id,
      description: description.join("\n"),
    });
  }
}

fs.writeFileSync("./data.json", JSON.stringify(parsedData), "utf8");
