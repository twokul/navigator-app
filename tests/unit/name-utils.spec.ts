import { expect, test } from "vitest";
import { toCapitalCase } from "@/lib/name-utils";

test("toCapitalCase", () => {
  expect(toCapitalCase("us dental licensure")).toBe("US Dental Licensure");
  expect(toCapitalCase("toefl guide")).toBe("TOEFL Guide");
  expect(toCapitalCase("bench test preparation")).toBe("Bench Test Preparation");
  expect(toCapitalCase("inbde guide")).toBe("INBDE Guide");
  expect(toCapitalCase("caapid")).toBe("CAAPID");
  expect(toCapitalCase("advanced standing program application")).toBe(
    "Advanced Standing Program Application",
  );
  expect(toCapitalCase("getting started")).toBe("Getting Started");
  expect(toCapitalCase("choosing your path")).toBe("Choosing Your Path");
  expect(toCapitalCase("researching schools")).toBe("Researching Schools");
  expect(toCapitalCase("finances and logistics")).toBe("Finances And Logistics");
  expect(toCapitalCase("related paths and resources")).toBe("Related Paths And Resources");
  expect(toCapitalCase("tools")).toBe("Tools");
  expect(toCapitalCase("Tools")).toBe("Tools");
});
