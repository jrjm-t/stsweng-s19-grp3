import { userApi, CreateUserRequest } from "./db.api";
import { supabase } from "./index"; // or adjust to where it’s exported

jest.mock("./index", () => {
  const fromMock = jest.fn();
  const selectMock = jest.fn();
  const eqMock = jest.fn();
  const maybeSingleMock = jest.fn();
  const insertMock = jest.fn();
  const selectAfterInsertMock = jest.fn();
  const singleMock = jest.fn();

  // build the query chain
  fromMock.mockReturnValue({
    select: selectMock,
    insert: insertMock,
  });

  selectMock.mockReturnValue({
    eq: eqMock,
  });

  eqMock.mockReturnValue({
    maybeSingle: maybeSingleMock,
  });

  maybeSingleMock.mockResolvedValue({
    data: null,       // means user does not exist yet
    error: null,
  });

  insertMock.mockReturnValue({
    select: selectAfterInsertMock,
  });

  selectAfterInsertMock.mockReturnValue({
    single: singleMock,
  });

  singleMock.mockResolvedValue({
    data: { id: 0, name: "testUser@gabay.org" },
    error: null,
  });

  return {
    supabase: {
      from: fromMock,
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

    expect(supabase.from).toHaveBeenCalledWith("users");
    // You can also check insert args if you like
    // but you’d need access to the insert mock from the jest.mock closure
    expect(result).toEqual({ id: 0, name: "testUser@gabay.org" });
  });
});