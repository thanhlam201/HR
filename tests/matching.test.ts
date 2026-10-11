import test from "node:test";
import assert from "node:assert/strict";
import {
  careerMatch,
  zodiac,
  lunarElement,
  elementRelation,
  quizStyle,
} from "../src/lib/matching.ts";
test("career matching uses skills/style/location and no birth data", () => {
  const job = {
    skills: ["React", "TypeScript", "CSS"],
    work_style: "flexible" as const,
    location: "Hà Nội",
  };
  const profile = {
    skills: ["react", "CSS"],
    work_style: "flexible" as const,
    location: "Hà Nội",
  };
  assert.deepEqual(careerMatch(profile, job), {
    score: 80,
    skillScore: 40,
    styleScore: 25,
    locationScore: 15,
    matched: ["React", "CSS"],
    missing: ["TypeScript"],
  });
  assert.equal(
    careerMatch(
      {
        ...profile,
        skills: [],
        work_style: "independent",
        location: "Đà Nẵng",
      },
      job,
    ).score,
    0,
  );
  assert.equal(
    careerMatch(profile, { ...job, location: "Remote" }).locationScore,
    15,
  );
});
test("duplicate profile skills cannot inflate coverage", () => {
  const match = careerMatch(
    {
      skills: ["React", "react", "React"],
      work_style: "independent",
      location: "",
    },
    { skills: ["React", "CSS"], work_style: "flexible", location: "Hà Nội" },
  );
  assert.equal(match.skillScore, 30);
});
test("zodiac checks dates and sign boundaries", () => {
  assert.equal(zodiac("1995-01-19")?.name, "Ma Kết");
  assert.equal(zodiac("1995-01-20")?.name, "Bảo Bình");
  assert.equal(zodiac("1995-12-25")?.name, "Ma Kết");
  assert.equal(zodiac("1995-02-30"), null);
  assert.equal(zodiac("bad"), null);
});
test("nap am uses supplied lunar year and repeats over a 60-year cycle", () => {
  assert.equal(lunarElement(1984), "Kim");
  assert.equal(lunarElement(1990), "Thổ");
  assert.equal(lunarElement(1995), "Hỏa");
  assert.equal(lunarElement(2044), "Kim");
  assert.equal(lunarElement(1899), null);
  assert.match(elementRelation("Mộc", "Hỏa"), /Mộc sinh Hỏa/);
});
test("work preferences choose most frequent answer with documented tie behavior", () => {
  assert.equal(quizStyle([2, 2, 1, 0]), "structured");
  assert.equal(quizStyle([0, 1, 2, 3]), "collaborative");
});
