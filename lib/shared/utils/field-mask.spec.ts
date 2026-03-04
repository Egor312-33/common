import { applyFieldMask, generateFieldMask } from "./field-mask.utils";

describe("Field Mask Utils", () => {
  describe("generateFieldMask", () => {
    it("should generate paths for a flat object", () => {
      const input = { title: "Hello", description: "World" };
      const result = generateFieldMask(input);
      expect(result).toEqual(["title", "description"]);
    });

    it("should generate nested paths", () => {
      const input = {
        video: {
          title: "Title",
          meta: { duration: 100 },
        },
      };
      const result = generateFieldMask(input);
      expect(result).toEqual(["video.title", "video.meta.duration"]);
    });

    it("should handle dates correctly (not treat as objects to recurse)", () => {
      const input = { updatedAt: new Date() };
      const result = generateFieldMask(input);
      expect(result).toEqual(["updatedAt"]);
    });

    it("should escape dots in keys", () => {
      const input = { "version.1": "active" };
      const result = generateFieldMask(input);
      expect(result).toEqual(["version\\.1"]);
    });
  });

  describe("applyFieldMask", () => {
    const source = {
      id: "1",
      title: "Original Title",
      description: "Original Desc",
      author: {
        name: "John",
        age: 30,
      },
      tags: ["action", "sci-fi"],
    };

    it("should pick only specified top-level fields", () => {
      const mask = ["title", "description"];
      const result = applyFieldMask(source, mask);

      expect(result).toEqual({
        title: "Original Title",
        description: "Original Desc",
      });
      expect(result).not.toHaveProperty("id");
      expect(result).not.toHaveProperty("author");
    });

    it("should pick nested fields and construct the object structure", () => {
      const mask = ["author.name"];
      const result = applyFieldMask(source, mask);

      expect(result).toEqual({
        author: {
          name: "John",
        },
      });
      expect(result.author).not.toHaveProperty("age");
    });

    it("should handle complex mixed masks", () => {
      const mask = ["id", "author.age", "tags"];
      const result = applyFieldMask(source, mask);

      expect(result).toEqual({
        id: "1",
        author: {
          age: 30,
        },
        tags: ["action", "sci-fi"],
      });
    });

    it("should handle escaped dots when picking fields", () => {
      const escapedSource = { "meta.data": "value", regular: "field" };
      const mask = ["meta\\.data"];
      const result = applyFieldMask(escapedSource, mask);

      expect(result).toEqual({ "meta.data": "value" });
    });

    it("should return undefined for non-existent paths in mask", () => {
      const mask = ["nonExistent.path"];
      const result = applyFieldMask(source, mask);
      expect(result).toEqual({});
    });
  });

  describe("Integration: generate and apply", () => {
    it("should result in a deep clone of the input when applying generated mask", () => {
      const input = { a: 1, b: { c: 2 }, d: new Date() };
      const mask = generateFieldMask(input);
      const result = applyFieldMask(input, mask);

      expect(result).toEqual(input);
      expect(result).not.toBe(input);
    });
  });
});
