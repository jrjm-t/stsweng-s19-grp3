import { userApi, CreateUserRequest } from "./db.api";

// Return a mocked module where `supabase.from()` returns an object
// that supports the chained methods used in production code.
jest.mock("./index", () => {
  const fromMock = jest.fn();
  const selectMock = jest.fn();
  const eqMock = jest.fn();
  const maybeSingleMock = jest.fn();
  const insertMock = jest.fn();
  const selectAfterInsertMock = jest.fn();
  const singleMock = jest.fn();
  const deleteMock = jest.fn();
  const deleteEqMock = jest.fn();

  fromMock.mockReturnValue({
    select: selectMock,
    insert: insertMock,
    delete: deleteMock,
  });

  selectMock.mockReturnValue({ eq: eqMock });
  eqMock.mockReturnValue({ maybeSingle: maybeSingleMock });
  maybeSingleMock.mockResolvedValue({ data: null, error: null });

  insertMock.mockReturnValue({ select: selectAfterInsertMock });
  selectAfterInsertMock.mockReturnValue({ single: singleMock });
  singleMock.mockResolvedValue({ data: { id: 0, name: "testUser@gabay.org" }, error: null });

  deleteMock.mockReturnValue({ eq: deleteEqMock });
  deleteEqMock.mockResolvedValue({ data: null, error: null });

  return {
    supabase: {
      from: fromMock,
    },
    __mocks__: {
      fromMock,
      selectMock,
      eqMock,
      maybeSingleMock,
      insertMock,
      selectAfterInsertMock,
      singleMock,
      deleteMock,
      deleteEqMock,
    },
  };
});

describe("userAPI", () => {
  it("creates a new entry in public.users table", async () => {
    const user: CreateUserRequest = {
      id: "0",
      username: "testUser@gabay.org",
      email: "testUser@gabay.org",
      admin: false
    };

    const result = await userApi.createUser(user);

    const mocked = jest.requireMock("./index") as any;
    const { supabase, __mocks__ } = mocked;

    expect(__mocks__.fromMock).toHaveBeenCalledWith("users");
    expect(result).toEqual({ id: 0, name: "testUser@gabay.org" });
  });
});

describe("userAPI deleteUser", () => {
  it("calls supabase.from('users').delete().eq(id) and returns true on success", async () => {
    const userId = "123";

    const result = await userApi.deleteUser(userId);

    const mocked = jest.requireMock("./index") as any;
    const { __mocks__ } = mocked;

    expect(__mocks__.fromMock).toHaveBeenCalledWith("users");
    expect(__mocks__.deleteMock).toHaveBeenCalled();
    expect(__mocks__.deleteEqMock).toHaveBeenCalledWith("id", userId);
    expect(result).toBe(true);
  });
});