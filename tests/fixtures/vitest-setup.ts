export async function setup() {
  try {
    const { prepareFixtureSuite } = await import("./corpus");
    await prepareFixtureSuite("vitest");
  } catch (error) {
    console.error(
      `Failed to prepare test corpus: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}
