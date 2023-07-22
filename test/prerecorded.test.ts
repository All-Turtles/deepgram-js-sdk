import { createClient } from "../src";
import { expect } from "chai";
import { faker } from "@faker-js/faker";
import { transcription, urlSource, readStreamSource, bufferSource } from "./mocks";
import DeepgramClient from "../src/DeepgramClient";
import nock from "nock";
import { appendSearchParams } from "../src/lib/helpers";
import { PreRecordedSource } from "../src/lib/types/PreRecordedSource";

const customDomain = faker.internet.url({ appendSlash: false });
console.log(customDomain);
const deepgram = createClient(faker.string.alphanumeric(40), {
  global: { url: customDomain },
});

describe("testing creation of a deepgram client object", () => {
  before(() => {
    if (!nock.isActive()) nock.activate();
    nock.disableNetConnect();
  });

  afterEach(() => {
    if (!nock.isDone()) {
      throw new Error(
        `Not all nock interceptors were used: ${JSON.stringify(nock.pendingMocks())}`
      );
    }

    nock.cleanAll();
  });

  after(() => {
    nock.restore();
  });

  it("it should create the client object", () => {
    expect(deepgram).to.not.be.undefined;
    expect(deepgram).is.instanceOf(DeepgramClient);
  });

  it("it should transcribe a URL source", async () => {
    const mockOptions = {};

    const params = new URLSearchParams();
    appendSearchParams(params, mockOptions);

    nock(customDomain).post(`/v1/listen?${params}`).reply(200, transcription);

    const { result, error } = await deepgram.transcription.prerecorded.listen(
      urlSource,
      mockOptions
    );

    expect(error).to.be.null;
    expect(result).to.deep.equal(transcription);
  });

  it("it should transcribe a ReadStream source", async () => {
    const mockOptions = {};

    const params = new URLSearchParams();
    appendSearchParams(params, mockOptions);

    nock(customDomain).post(`/v1/listen?${params}`).reply(200, transcription);

    const { result, error } = await deepgram.transcription.prerecorded.listen(
      readStreamSource,
      mockOptions
    );

    expect(error).to.be.null;
    expect(result).to.deep.equal(transcription);
  });

  it("it should not try to transcribe a ReadStream source when missing a mimetype", async () => {
    const mockOptions = {};

    const params = new URLSearchParams();
    appendSearchParams(params, mockOptions);

    readStreamSource.mimetype = "";

    const { result, error } = await deepgram.transcription.prerecorded.listen(
      readStreamSource,
      mockOptions
    );

    expect(result).to.be.null;
    expect(error?.message).to.equal(
      "Mimetype must be provided if the source is a Buffer or a Readable"
    );
  });

  it("it should transcribe a Buffer source", async () => {
    const mockOptions = {};

    const params = new URLSearchParams();
    appendSearchParams(params, mockOptions);

    nock(customDomain).post(`/v1/listen?${params}`).reply(200, transcription);

    const { result, error } = await deepgram.transcription.prerecorded.listen(
      bufferSource,
      mockOptions
    );

    expect(error).to.be.null;
    expect(result).to.deep.equal(transcription);
  });

  it("it should not try to transcribe a Buffer source when missing a mimetype", async () => {
    const mockOptions = {};

    const params = new URLSearchParams();
    appendSearchParams(params, mockOptions);

    bufferSource.mimetype = "";

    const { result, error } = await deepgram.transcription.prerecorded.listen(
      bufferSource,
      mockOptions
    );

    expect(result).to.be.null;
    expect(error?.message).to.equal(
      "Mimetype must be provided if the source is a Buffer or a Readable"
    );
  });

  it("it should not try to transcribe an unknown source", async () => {
    const mockOptions = {};

    const params = new URLSearchParams();
    appendSearchParams(params, mockOptions);

    const unknownSource = {
      test: "breaker",
      mimetype: "application/xml",
    };

    const { result, error } = await deepgram.transcription.prerecorded.listen(
      unknownSource as unknown as PreRecordedSource,
      mockOptions
    );

    expect(result).to.be.null;
    expect(error?.message).to.equal("Unknown transcription source type");
  });
});
